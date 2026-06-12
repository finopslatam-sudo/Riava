from celery import Celery
from app.core.config import settings

app = Celery(
    "riava_leads",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.meta_tasks",
        "app.tasks.lead_tasks",
        "app.tasks.notification_tasks",
    ],
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.tasks.meta_tasks.*": {"queue": "meta"},
        "app.tasks.lead_tasks.*": {"queue": "leads"},
        "app.tasks.notification_tasks.*": {"queue": "notifications"},
    },
    beat_schedule={
        "refresh-meta-tokens-daily": {
            "task": "app.tasks.meta_tasks.refresh_expiring_meta_tokens",
            "schedule": 3600 * 12,  # every 12 hours
        },
    },
)
