from celery import Celery
from app.core.config import settings

# Create a Celery instance
celery_app = Celery(
    "kaapi",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks"]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=2,
)

# Optional: Define default queue
celery_app.conf.task_default_queue = "default"

# Create a base task class that all other tasks will inherit from
class BaseTask(celery_app.Task):
    abstract = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        # Log task failure
        print(f"Task {task_id} failed: {exc}")
        super().on_failure(exc, task_id, args, kwargs, einfo)

    def on_success(self, retval, task_id, args, kwargs):
        # Log task success
        print(f"Task {task_id} completed successfully")
        super().on_success(retval, task_id, args, kwargs)

celery_app.Task = BaseTask
