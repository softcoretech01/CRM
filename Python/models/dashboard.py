from pydantic import BaseModel
from typing import Optional


class DashboardKPI(BaseModel):
    total_leads: int = 0
    qualified: int = 0
    open_opportunities: int = 0
    won_deals_value: float = 0.0


class ConversionStat(BaseModel):
    name: str
    value: int


class PipelineStage(BaseModel):
    name: str
    value: int


class RevenueForecast(BaseModel):
    name: str
    actual: Optional[float] = 0.0
    target: Optional[float] = 0.0


class ActivityPerformance(BaseModel):
    name: str
    Tasks: int = 0
    Calls: int = 0
    Meetings: int = 0
