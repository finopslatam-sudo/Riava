from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_leads: int
    new_leads_today: int
    leads_this_month: int
    conversion_rate: float
    avg_score: float
    active_campaigns: int
    total_spend: float
    cpl: float
