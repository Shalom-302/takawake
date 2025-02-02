# app/plugins/advanced_scheduler/celeryconfig.py
import os

broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")

task_serializer = "json"
result_serializer = "json"
accept_content = ["json"]
timezone = "UTC"
enable_utc = True

# If you use Celery beat, you can set beat_scheduler here or do it in your main Celery file
# e.g. beat_scheduler = "app.plugins.advanced_scheduler.myscheduler.DatabaseScheduler"
