from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from models.contact import ContactCreate, ContactUpdate, ContactResponse
from database import call_procedure, call_procedure_single

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])


@router.get("", response_model=List[ContactResponse])
def get_contacts(search: Optional[str] = Query(None)):
    rows = call_procedure("sp_get_contacts", (search or "",))
    return rows


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int):
    row = call_procedure_single("sp_get_contact_by_id", (contact_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Contact not found")
    return row


@router.post("", response_model=dict)
def create_contact(contact: ContactCreate):
    result = call_procedure_single("sp_create_contact", (
        contact.name, contact.account_id, contact.account_name,
        contact.email, contact.phone, contact.designation,
        contact.preferred_comm, contact.location
    ))
    return {"id": result["id"], "message": "Contact created successfully"}


@router.put("/{contact_id}", response_model=dict)
def update_contact(contact_id: int, contact: ContactUpdate):
    call_procedure("sp_update_contact", (
        contact_id, contact.name, contact.account_id, contact.account_name,
        contact.email, contact.phone, contact.designation,
        contact.preferred_comm, contact.location
    ))
    return {"message": "Contact updated successfully"}


@router.delete("/{contact_id}", response_model=dict)
def delete_contact(contact_id: int):
    call_procedure("sp_delete_contact", (contact_id,))
    return {"message": "Contact deleted successfully"}
