from fastapi import APIRouter, HTTPException
from typing import List
from models.opportunity import (
    OpportunityCreate, OpportunityUpdate,
    OpportunityStageUpdate, OpportunityResponse
)
from database import call_procedure, call_procedure_single
from collections import defaultdict

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])


@router.get("", response_model=List[OpportunityResponse])
def get_opportunities():
    rows = call_procedure("sp_get_opportunities", ())
    return rows


@router.get("/by-stage")
def get_opportunities_by_stage():
    rows = call_procedure("sp_get_opportunities_by_stage", ())
    grouped = defaultdict(list)
    for row in rows:
        stage = row.get("stage", "Prospect")
        grouped[stage].append(row)
    # Ensure all stages exist
    for stage in ["Prospect", "Qualification", "Proposal", "Negotiation", "Won"]:
        if stage not in grouped:
            grouped[stage] = []
    return dict(grouped)


@router.post("", response_model=dict)
def create_opportunity(opp: OpportunityCreate):
    result = call_procedure_single("sp_create_opportunity", (
        opp.name, opp.account_name, opp.value, opp.probability,
        opp.close_date, opp.owner, opp.stage
    ))
    return {"id": result["id"], "message": "Opportunity created successfully"}


@router.put("/{opp_id}", response_model=dict)
def update_opportunity(opp_id: int, opp: OpportunityUpdate):
    call_procedure("sp_update_opportunity", (
        opp_id, opp.name, opp.account_name, opp.value,
        opp.probability, opp.close_date, opp.owner, opp.stage
    ))
    return {"message": "Opportunity updated successfully"}


@router.put("/{opp_id}/stage", response_model=dict)
def update_opportunity_stage(opp_id: int, data: OpportunityStageUpdate):
    call_procedure("sp_update_opportunity_stage", (opp_id, data.stage))
    return {"message": "Stage updated successfully"}


@router.delete("/{opp_id}", response_model=dict)
def delete_opportunity(opp_id: int):
    call_procedure("sp_delete_opportunity", (opp_id,))
    return {"message": "Opportunity deleted successfully"}
