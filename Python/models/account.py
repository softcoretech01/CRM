from pydantic import BaseModel
from typing import Optional


class AccountCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    gst: Optional[str] = None
    owner: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None


class AccountUpdate(BaseModel):
    name: str
    industry: Optional[str] = None
    gst: Optional[str] = None
    owner: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None


class AccountResponse(BaseModel):
    id: int
    name: str
    industry: Optional[str] = None
    gst: Optional[str] = None
    owner: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[int] = 1
