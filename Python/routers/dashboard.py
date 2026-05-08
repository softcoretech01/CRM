from fastapi import APIRouter
from typing import List
from models.dashboard import (
    DashboardKPI, ConversionStat, PipelineStage,
    RevenueForecast, ActivityPerformance
)
from database import call_procedure, call_procedure_single

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Reports"])


@router.get("/kpis", response_model=DashboardKPI)
def get_kpis():
    row = call_procedure_single("sp_get_dashboard_kpis", ())
    if not row:
        return DashboardKPI()
    return row


@router.get("/conversion-stats", response_model=List[ConversionStat])
def get_conversion_stats():
    rows = call_procedure("sp_get_lead_conversion_stats", ())
    return rows


@router.get("/pipeline-stages", response_model=List[PipelineStage])
def get_pipeline_stages():
    rows = call_procedure("sp_get_pipeline_by_stage", ())
    return rows


@router.get("/revenue-forecast", response_model=List[RevenueForecast])
def get_revenue_forecast():
    rows = call_procedure("sp_get_revenue_forecast", ())
    return rows


@router.get("/activity-performance", response_model=List[ActivityPerformance])
def get_activity_performance():
    rows = call_procedure("sp_get_activity_performance", ())
    return rows
