from pydantic import BaseModel
from typing import Optional

class MasterBase(BaseModel):
    category: str
    value: str
    is_active: bool = True

class MasterCreate(MasterBase):
    pass

class MasterUpdate(MasterBase):
    pass

class MasterResponse(MasterBase):
    id: int
    
    class Config:
        from_attributes = True
