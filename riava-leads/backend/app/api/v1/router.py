from fastapi import APIRouter

from app.api.v1.auth.router import router as auth_router
from app.api.v1.users.router import router as users_router
from app.api.v1.meta.router import router as meta_router
from app.api.v1.campaigns.router import router as campaigns_router
from app.api.v1.leads.router import router as leads_router
from app.api.v1.webhooks.router import router as webhooks_router
from app.api.v1.analytics.router import router as analytics_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(meta_router, prefix="/meta", tags=["Meta Ads"])
api_router.include_router(campaigns_router, prefix="/campaigns", tags=["Campaigns"])
api_router.include_router(leads_router, prefix="/leads", tags=["Leads"])
api_router.include_router(webhooks_router, prefix="/webhooks", tags=["Webhooks"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
