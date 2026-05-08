from pydantic import BaseModel
from typing import Optional
from datetime import date, time


class ActivityCreate(BaseModel):
    subject: str
    type: Optional[str] = None
    priority: Optional[str] = "Medium"
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    related_to: Optional[str] = None
    notes: Optional[str] = None


class ActivityUpdate(BaseModel):
    subject: str
    type: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    related_to: Optional[str] = None
    notes: Optional[str] = None


class ActivityCompleteUpdate(BaseModel):
    is_complete: bool


class ActivityResponse(BaseModel):
    id: int
    subject: str
    type: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    related_to: Optional[str] = None
    notes: Optional[str] = None
    is_complete: Optional[int] = 0
    is_active: Optional[int] = 1
