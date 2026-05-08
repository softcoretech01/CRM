from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from models.activity import ActivityCreate, ActivityUpdate, ActivityCompleteUpdate, ActivityResponse
from database import call_procedure, call_procedure_single

router = APIRouter(prefix="/api/activities", tags=["Activities"])


@router.get("", response_model=List[ActivityResponse])
def get_activities():
    rows = call_procedure("sp_get_activities", ())
    return rows


@router.get("/by-date", response_model=List[ActivityResponse])
def get_activities_by_date(date: str = Query(...)):
    rows = call_procedure("sp_get_activities_by_date", (date,))
    return rows


@router.post("", response_model=dict)
def create_activity(activity: ActivityCreate):
    result = call_procedure_single("sp_create_activity", (
        activity.subject, activity.type, activity.priority,
        activity.due_date, activity.due_time, activity.related_to, activity.notes
    ))
    return {"id": result["id"], "message": "Activity created successfully"}


@router.put("/{activity_id}", response_model=dict)
def update_activity(activity_id: int, activity: ActivityUpdate):
    call_procedure("sp_update_activity", (
        activity_id, activity.subject, activity.type, activity.priority,
        activity.due_date, activity.due_time, activity.related_to, activity.notes
    ))
    return {"message": "Activity updated successfully"}


@router.put("/{activity_id}/complete", response_model=dict)
def mark_activity_complete(activity_id: int, data: ActivityCompleteUpdate):
    call_procedure("sp_mark_activity_complete", (activity_id, int(data.is_complete)))
    return {"message": "Activity status updated"}


@router.delete("/{activity_id}", response_model=dict)
def delete_activity(activity_id: int):
    call_procedure("sp_delete_activity", (activity_id,))
    return {"message": "Activity deleted successfully"}
