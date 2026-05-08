from pydantic import BaseModel
from typing import Optional


class ContactCreate(BaseModel):
    name: str
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    preferred_comm: Optional[str] = None
    location: Optional[str] = None


class ContactUpdate(BaseModel):
    name: str
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    preferred_comm: Optional[str] = None
    location: Optional[str] = None


class ContactResponse(BaseModel):
    id: int
    name: str
    account_id: Optional[int] = None
    account_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    preferred_comm: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[int] = 1
