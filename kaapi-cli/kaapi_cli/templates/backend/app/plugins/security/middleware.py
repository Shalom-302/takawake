# /backend/app/plugins/security/middleware.py
from fastapi import Request, HTTPException, Response
from fastapi.responses import JSONResponse
from .intrusion_detection import IntrusionDetector
from .mfa_service import MFAService
from app.models.user import User
import aiofiles
from app.core.config import settings as config
from datetime import datetime
from .session_service import SessionManager
from .waf import WebApplicationFirewall
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import logging

class SessionMiddleware:
    def __init__(self, session_manager: SessionManager):
        self.manager = session_manager

    async def __call__(self, request: Request, call_next):
        session_token = request.cookies.get("session_token")
        
        try:
          # Retrieve both session and encrypted token
            user_session , encrypted_token= await self.manager.validate_session(session_token)
            request.state.session = user_session
        except (ValueError, PermissionError) as e:
            return JSONResponse(
                status_code=403,
                content={"detail": str(e)}
            )
            
        response = await call_next(request)
        
        # Update cookie
        response.set_cookie(
          key="session_token",
          value=encrypted_token,  # Use the SessionManager's encrypted token
          httponly=True,
          secure=not config.DEBUG,
          samesite="Strict",
          domain=config.SESSION_DOMAIN,
          max_age=config.SESSION_MAX_AGE,
          path="/",
        ) 
        
        return response

class SecurityHeadersMiddleware:
    async def __call__(self, request: Request, call_next):
        response = await call_next(request)
        security_headers = {
            "Content-Security-Policy": "default-src 'self'",
            "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block"
        }
        response.headers.update(security_headers)
        return response

class SecurityMiddlewareEnhanced(BaseHTTPMiddleware):
    def __init__(self,  app: ASGIApp, detector: IntrusionDetector, mfa_service: MFAService, waf : WebApplicationFirewall):
        super().__init__(app)
        self.detector = detector
        self.mfa_service = mfa_service
        self.waf = waf

    async def log_encrypted_audit(self, encrypted_log: str):
        async with aiofiles.open("/var/log/security_audit.log", "a") as f:
            await f.write(f"{datetime.utcnow().isoformat()} | {encrypted_log}\n")

    async def _requires_mfa(self, request: Request, user: User) -> bool:
        protected_paths = [
            "/plugins/security/decrypt",
            "/admin",
            "/user/privileged"
        ]
        return any(
            request.url.path.startswith(path)
            for path in protected_paths
        ) and user.mfa_enabled
    
    async def _validate_mfa(self, request: Request, user: User) -> bool:
        mfa_code = request.headers.get("X-MFA-Code", "")
        return await self.mfa_service.verify_mfa_code(user.id, mfa_code)

    async def _validate_request_chain(self, request: Request, user: User):
        # Bypass validation for documentation and static files
        if request.url.path.startswith(("/docs", "/redoc", "/static", "/openapi.json")):
            return

        # Skip validation if no user (unauthenticated public routes)
        if user is None:
            return

        # Continue with standard validation for authenticated users
        if self.mfa_service and await self._requires_mfa(request, user):
            result = await self._validate_mfa(request, user)
            if not result:
                self.detector.log_security_event(
                    "mfa_required", 
                    {"user_id": user.id, "path": request.url.path}
                )
                raise HTTPException(401, "MFA required")

        # Check if user account is locked
        if self.detector.check_lockout(user.id):
            self.detector.log_security_event(
                "access_while_locked", 
                {
                    "user_id": user.id, 
                    "path": request.url.path
                }
            )
            raise HTTPException(403, "Account locked")

    async def dispatch(self, request: Request, call_next):
        try:
            # Skip security middleware for metrics endpoint, root endpoint, and advanced logging endpoints
            if (request.url.path == "/metrics" or 
                request.url.path == "/" or 
                request.url.path.startswith("/plugins/advanced-logging/")):
                return await call_next(request)
                
            # WAF check first
            logging.debug("SecurityMiddleware: Starting WAF check")
            try:
                if self.waf:
                    waf_response = await self.waf(request, call_next)
                    if waf_response and waf_response.status_code != 200:
                        logging.debug(f"SecurityMiddleware: WAF rejected request with status {waf_response.status_code}")
                        return waf_response
                logging.debug("SecurityMiddleware: WAF check passed")
            except Exception as waf_error:
                logging.error(f"SecurityMiddleware: WAF error: {str(waf_error)}", exc_info=True)
                # Continue processing even if WAF fails
            
            # Vérifier si user existe dans request.state
            if not hasattr(request.state, "user"):
                logging.warning("SecurityMiddleware: No user found in request state")
                request.state.user = None  # Définir une valeur par défaut pour éviter l'erreur
            
            user = request.state.user
            logging.debug(f"SecurityMiddleware: User retrieved: {user.id if user else 'anonymous'}")
            
            try:
                await self._validate_request_chain(request, user)
                logging.debug("SecurityMiddleware: Request chain validation passed")
            except Exception as validation_error:
                logging.error(f"SecurityMiddleware: Validation error: {str(validation_error)}", exc_info=True)
                raise HTTPException(status_code=403, detail="Request validation failed")
            
            response = await call_next(request)
            logging.debug("SecurityMiddleware: Response received from next middleware")

            # Audit after successful processing
            if "/decrypt" in request.url.path and user:
                try:
                    await self._log_decrypt_attempt(user, request, response)
                except Exception as decrypt_log_error:
                    logging.error(f"SecurityMiddleware: Error logging decrypt attempt: {str(decrypt_log_error)}")

            return response
            
        except HTTPException:
            logging.debug("SecurityMiddleware: Handling HTTPException")
            raise
        except Exception as e:
            logging.error(f"SecurityMiddleware: Caught exception: {str(e)}", exc_info=True)
            self.detector.log_security_event("middleware_error", {"error": str(e), "path": request.url.path})
            raise HTTPException(status_code=500, detail="Internal error")

    async def _log_decrypt_attempt(self, user: User, request: Request, response: Response):
        audit_data = {
            "user_id": user.id,
            "ip": request.client.host,
            "success": 200 <= response.status_code < 300,
            "timestamp": datetime.utcnow().isoformat()
        }
        encrypted_log = self.detector.crypto_service.encrypt_audit_log(audit_data)
        async with aiofiles.open(config.AUDIT_LOG_PATH, "a") as f:
            await f.write(f"{encrypted_log}\n")