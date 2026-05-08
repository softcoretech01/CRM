from pydantic import BaseModel
from typing import Optional
from datetime import date


class OpportunityCreate(BaseModel):
    name: str
    account_name: Optional[str] = None
    value: Optional[float] = 0.0
    probability: Optional[int] = 0
    close_date: Optional[date] = None
    owner: Optional[str] = None
    stage: Optional[str] = "Prospect"


class OpportunityUpdate(BaseModel):
    name: str
    account_name: Optional[str] = None
    value: Optional[float] = 0.0
    probability: Optional[int] = 0
    close_date: Optional[date] = None
    owner: Optional[str] = None
    stage: Optional[str] = None


class OpportunityStageUpdate(BaseModel):
    stage: str


class OpportunityResponse(BaseModel):
    id: int
    name: str
    account_name: Optional[str] = None
    value: Optional[float] = 0.0
    probability: Optional[int] = 0
    close_date: Optional[date] = None
    owner: Optional[str] = None
    stage: Optional[str] = None
    is_active: Optional[int] = 1
