from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from models.lead import LeadCreate, LeadUpdate, LeadResponse, LeadConvert
from database import call_procedure, call_procedure_single

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.get("", response_model=List[LeadResponse])
def get_leads(search: Optional[str] = Query(None), status: Optional[str] = Query(None)):
    rows = call_procedure("sp_get_leads", (search or "", status or ""))
    return rows


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: int):
    row = call_procedure_single("sp_get_lead_by_id", (lead_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Lead not found")
    return row


@router.post("", response_model=dict)
def create_lead(lead: LeadCreate):
    result = call_procedure_single("sp_create_lead", (
        lead.name, lead.company, lead.source, lead.phone, lead.email,
        lead.status, lead.assigned_to, lead.industry, lead.location
    ))
    return {"id": result["id"], "message": "Lead created successfully"}


@router.put("/{lead_id}", response_model=dict)
def update_lead(lead_id: int, lead: LeadUpdate):
    call_procedure("sp_update_lead", (
        lead_id, lead.name, lead.company, lead.source, lead.phone,
        lead.email, lead.status, lead.assigned_to, lead.industry, lead.location
    ))
    return {"message": "Lead updated successfully"}


@router.delete("/{lead_id}", response_model=dict)
def delete_lead(lead_id: int):
    call_procedure("sp_delete_lead", (lead_id,))
    return {"message": "Lead deleted successfully"}


@router.post("/{lead_id}/convert", response_model=dict)
def convert_lead(lead_id: int, data: LeadConvert):
    if data.convert_to not in ("Account", "Contact", "Opportunity"):
        raise HTTPException(status_code=400, detail="Invalid conversion type")
    call_procedure("sp_convert_lead", (lead_id, data.convert_to))
    return {"message": f"Lead converted to {data.convert_to} successfully"}
