# /backend/app/plugins/security/middleware.py
from fastapi import Request, HTTPException, Response
from fastapi.responses import JSONResponse
from .intrusion_detection import IntrusionDetector
from .mfa_service import MFAService
from app.plugins.advanced_auth.models import User
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
        """
        Main middleware dispatch method that processes incoming requests.
        Provides security checks and logs security-related events.
        """
        user = None
        
        # Always allow OPTIONS requests for CORS preflight
        if request.method == "OPTIONS":
            logging.debug(f"SecurityMiddleware: Allowing OPTIONS request to {request.url.path}")
            return await call_next(request)

        # Bypass all security checks for privacy routes
        if (request.url.path.startswith("/privacy/") or 
            request.url.path.startswith("/plugins/privacy_compliance/") or
            request.url.path.startswith("/plugins/advanced_audit/")):
            logging.debug(f"SecurityMiddleware: Bypassing security checks for route: {request.url.path}")
            return await call_next(request)
            
        try:
            # Try to extract user from request if authenticated
            try:
                user = request.state.user if hasattr(request.state, "user") else None
                if user:
                    logging.debug(f"SecurityMiddleware: User {user.email} found in request")
                else:
                    logging.warning(f"SecurityMiddleware: No user found in request state")
            except Exception as user_error:
                logging.error(f"SecurityMiddleware: Error extracting user: {str(user_error)}")
                
            # Exclude cookie-related endpoints from WAF checks
            cookie_endpoints = [
                "/privacy/cookie-settings",
                "/privacy/cookie-consent",
                "/privacy/my-cookie-consent"
            ]
            
            # Check for blocked patterns in request
            if self.waf and not any(request.url.path.endswith(endpoint) for endpoint in cookie_endpoints):
                try:
                    # Proper WAF check - using the pattern recommended for callable middleware
                    # Instead of calling the WAF directly with call_next, check it first
                    waf_blocked = await self.waf.check_security(request, user)
                    if waf_blocked:
                        logging.debug(f"SecurityMiddleware: WAF rejected request")
                        self.detector.log_security_event("waf_blocked", {"path": request.url.path})
                        raise HTTPException(status_code=403, detail="Access blocked by security policy")
                    logging.debug("SecurityMiddleware: WAF check passed")
                except AttributeError:
                    # Fallback if check_security method doesn't exist
                    logging.warning("WAF object doesn't have check_security method - using direct validation")
                    if hasattr(self.waf, "validate_request"):
                        if not await self.waf.validate_request(request):
                            self.detector.log_security_event("waf_blocked", {"path": request.url.path})
                            raise HTTPException(status_code=403, detail="Access blocked by security policy")
                except Exception as waf_error:
                    logging.error(f"SecurityMiddleware: WAF error: {str(waf_error)}")
                    self.detector.log_security_event("waf_blocked", {"error": str(waf_error), "path": request.url.path})
                    raise HTTPException(status_code=403, detail="Access blocked by security policy")
            
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
            # Log more detailed error information
            logging.error(f"SecurityMiddleware: Caught exception: {str(e)}", exc_info=True)
            logging.error(f"SecurityMiddleware: Request path: {request.url.path}")
            logging.error(f"SecurityMiddleware: Request method: {request.method}")
            logging.error(f"SecurityMiddleware: User in request: {getattr(request.state, 'user', None)}")
            
            # Also log the exception type
            logging.error(f"SecurityMiddleware: Exception type: {type(e).__name__}")
            
            self.detector.log_security_event("middleware_error", {"error": str(e), "path": request.url.path})
            raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

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