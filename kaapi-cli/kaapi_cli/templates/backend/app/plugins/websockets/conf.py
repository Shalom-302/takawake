import socketio
import os


RABBITMQ_USERNAME = os.getenv("RABBITMQ_USERNAME", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = os.getenv("RABBITMQ_PORT", 5672)

SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME")  # load from .env in real usage
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
