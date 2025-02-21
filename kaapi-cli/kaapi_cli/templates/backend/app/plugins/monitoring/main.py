    
# main.py
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter,  Response

def get_router():
    router = APIRouter(tags=["Monitoring"])
    
    @router.get("/metrics")
    async def metrics_endpoint():
        return Response(
            content=generate_latest(), 
            media_type=CONTENT_TYPE_LATEST
        )
    
    return router