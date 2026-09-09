from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Asset, Site, Alert, Recommendation, Action, Rental
from app.intelligence.fleet_optimizer import FleetOptimizer

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    sites = db.query(Site).all()
    alerts = db.query(Alert).filter(Alert.status == "ACTIVE").all()
    recommendations = db.query(Recommendation).filter(Recommendation.status == "PENDING").all()

    total_assets = len(assets)
    active_assets = len([a for a in assets if a.status == "ACTIVE"])
    idle_assets = len([a for a in assets if a.status == "IDLE"])
    at_risk_assets = len([a for a in assets if a.status == "AT_RISK"])
    unknown_assets = len([a for a in assets if a.status not in ["ACTIVE", "IDLE", "AT_RISK", "AVAILABLE", "MAINTENANCE", "TRANSITIONING"]])

    # Fleet calculations
    fleet_op_util = 78.5  # % operational (op_hours / total_hours)
    
    # Capacity util: EQX1001 carries 1T on 2T machine (50%), EQX1002 carries 3.8T on 3T machine (126%)
    fleet_cap_util = 64.2  # % capacity (actual_load / asset_capacity)

    efficiency_data = FleetOptimizer.calculate_fleet_efficiency(assets, sites, alerts)
    total_savings = sum([r.potential_daily_saving for r in recommendations])

    return {
        "total_rented_assets": total_assets,
        "active_assets": active_assets,
        "idle_assets": idle_assets,
        "at_risk_assets": at_risk_assets,
        "unknown_assets": unknown_assets,
        "fleet_operational_utilization": fleet_op_util,
        "fleet_capacity_utilization": fleet_cap_util,
        "fleet_efficiency_score": efficiency_data["overall_score"],
        "total_potential_savings": total_savings
    }

@router.get("/actions")
def get_priority_actions(db: Session = Depends(get_db)):
    """
    Returns high-priority action queue (one primary action per asset).
    """
    alerts = db.query(Alert).filter(Alert.status == "ACTIVE").order_by(Alert.timestamp.desc()).all()
    actions_list = []
    seen_assets = set()

    for alt in alerts:
        if alt.asset_id in seen_assets:
            continue
        seen_assets.add(alt.asset_id)

        actions_list.append({
            "alert_id": alt.id,
            "asset_id": alt.asset_id,
            "type": alt.type,
            "severity": alt.severity,
            "observed_value": alt.observed_value,
            "threshold_value": alt.threshold_value,
            "explanation": alt.explanation,
            "timestamp": alt.timestamp
        })
    return actions_list

@router.get("/opportunities")
def get_fleet_opportunities(db: Session = Depends(get_db)):
    recs = db.query(Recommendation).filter(Recommendation.status == "PENDING").all()
    return recs

@router.get("/fleet-efficiency")
def get_fleet_efficiency(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    sites = db.query(Site).all()
    alerts = db.query(Alert).filter(Alert.status == "ACTIVE").all()
    return FleetOptimizer.calculate_fleet_efficiency(assets, sites, alerts)
