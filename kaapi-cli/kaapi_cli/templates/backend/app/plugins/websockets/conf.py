import socketio
from app.core.config import settings


RABBITMQ_USERNAME = settings.RABBITMQ_USERNAME
RABBITMQ_PASSWORD = settings.RABBITMQ_PASSWORD
RABBITMQ_HOST = settings.RABBITMQ_HOST
RABBITMQ_PORT = settings.RABBITMQ_PORT

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"

sio = socketio.AsyncServer(
    client_manager=socketio.AsyncAioPikaManager(
        (
            f'amqp://{RABBITMQ_USERNAME}:{RABBITMQ_PASSWORD}@'
            f'{RABBITMQ_HOST}:{RABBITMQ_PORT}'
        )
    ),
    async_mode='asgi',
    cors_allowed_origins= [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    cors_credentials=True,
    namespaces=['/ws'],
)
