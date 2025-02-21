import logging
import jwt
from fastapi import APIRouter,  Response

from .conf import sio

def get_router():
    router = APIRouter(tags=["Websocket"])
    
    @router.get("/websocket")
    async def manage_websocket():
        print("ok")
    return router

@sio.event
async def connect(sid, environ, auth):
    """Triggered when client connects"""
    if not auth:
        logging.error('ws Connection failed: no authorization')
        return False

    session_uuid = auth.get('session_uuid')
    token = auth.get('token')
    if not token or not session_uuid:
        logging.error('ws Connection failed: authorization failed, please check')
        return False
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")  # sub is stored as a string
        if not user_id_str:
            logging.error('ws Connection failed: authorization failed, please check')
            return False
        user_id = int(user_id_str)
    except jwt.ExpiredSignatureError:
        return False
    except jwt.DecodeError:
        return False
    except ValueError:
        # e.g. int() conversion failed
        return False
    
    # TODO: Save session_uuid to Redis
    
    return True


@sio.event
async def disconnect(sid):
    """Triggered when the client disconnects"""
    # TODO: Remove session_uuid from Redis
    return True