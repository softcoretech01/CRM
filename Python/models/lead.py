from pydantic import BaseModel
from typing import Optional
from datetime import date


class LeadCreate(BaseModel):
    name: str
    company: Optional[str] = None
    source: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = "New"
    assigned_to: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None


class LeadUpdate(BaseModel):
    name: str
    company: Optional[str] = None
    source: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    name: str
    company: Optional[str] = None
    source: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    created_date: Optional[date] = None
    is_active: Optional[int] = 1


class LeadConvert(BaseModel):
    convert_to: str  # 'Account', 'Contact', or 'Opportunity'
