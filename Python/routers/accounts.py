from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from models.account import AccountCreate, AccountUpdate, AccountResponse
from database import call_procedure, call_procedure_single

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.get("", response_model=List[AccountResponse])
def get_accounts(search: Optional[str] = Query(None)):
    rows = call_procedure("sp_get_accounts", (search or "",))
    return rows


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int):
    row = call_procedure_single("sp_get_account_by_id", (account_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Account not found")
    return row


@router.post("", response_model=dict)
def create_account(account: AccountCreate):
    result = call_procedure_single("sp_create_account", (
        account.name, account.industry, account.gst,
        account.owner, account.location, account.address
    ))
    return {"id": result["id"], "message": "Account created successfully"}


@router.put("/{account_id}", response_model=dict)
def update_account(account_id: int, account: AccountUpdate):
    call_procedure("sp_update_account", (
        account_id, account.name, account.industry, account.gst,
        account.owner, account.location, account.address
    ))
    return {"message": "Account updated successfully"}


@router.delete("/{account_id}", response_model=dict)
def delete_account(account_id: int):
    call_procedure("sp_delete_account", (account_id,))
    return {"message": "Account deleted successfully"}
