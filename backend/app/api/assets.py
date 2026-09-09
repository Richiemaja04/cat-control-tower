from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.entities import Asset, Telemetry, Trip, Alert
from app.schemas.schemas import AssetResponse, TelemetryResponse, TripResponse

router = APIRouter(prefix="/assets", tags=["Assets"])

def _populate_asset_telemetry(item: AssetResponse, a: Asset, latest_t: Telemetry):
    load_tons = latest_t.current_load_tons if latest_t else (0.0 if a.status == "AVAILABLE" else round(min(a.capacity_tons, 1.5), 1))
    cap_util = round((load_tons / a.capacity_tons) * 100.0, 1) if a.capacity_tons > 0 else 0.0
    op_util = 75.0 if a.status == "ACTIVE" else (30.0 if a.status == "IDLE" else 0.0)

    item.current_load_tons = load_tons
    item.capacity_utilization = cap_util
    item.operational_utilization = op_util

    if latest_t:
        item.engine_temperature = round(latest_t.engine_temperature, 1)
        item.hydraulic_pressure = round(latest_t.hydraulic_pressure, 1)
        item.speed = round(latest_t.speed, 1)
        item.idle_hours = round(latest_t.idle_hours, 1)
        item.trips_completed = latest_t.trips_completed
    else:
        if a.status == "AVAILABLE":
            item.engine_temperature = 35.0  # Cold standby
            item.hydraulic_pressure = 190.0 # Standby pressure
            item.speed = 0.0
            item.idle_hours = 0.0
            item.trips_completed = 0
        elif a.status == "IDLE":
            item.engine_temperature = 78.0  # Warm idle
            item.hydraulic_pressure = 200.0
            item.speed = 0.0
            item.idle_hours = round(a.engine_hours * 0.2, 1)
            item.trips_completed = int(a.engine_hours * 1.5)
        elif a.status == "AT_RISK":
            item.engine_temperature = 96.0  # Overheating / stress
            item.hydraulic_pressure = 245.0 # Max pressure stress
            item.speed = 12.0
            item.idle_hours = round(a.engine_hours * 0.1, 1)
            item.trips_completed = int(a.engine_hours * 2.0)
        else:
            item.engine_temperature = 86.5  # Normal operating temp
            item.hydraulic_pressure = 212.0 # Normal operating pressure
            item.speed = 16.5
            item.idle_hours = round(a.engine_hours * 0.15, 1)
            item.trips_completed = int(a.engine_hours * 1.8)

    item.operating_hours = round(max(0.0, a.engine_hours - item.idle_hours), 1)
    return item

@router.get("", response_model=List[AssetResponse])
@router.get("/", response_model=List[AssetResponse])
def list_assets(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    result = []
    for a in assets:
        latest_t = db.query(Telemetry).filter(Telemetry.asset_id == a.id).order_by(Telemetry.timestamp.desc()).first()
        item = AssetResponse.model_validate(a)
        _populate_asset_telemetry(item, a, latest_t)
        result.append(item)
    return result

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    a = db.query(Asset).filter(Asset.id == asset_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Asset not found")
    latest_t = db.query(Telemetry).filter(Telemetry.asset_id == a.id).order_by(Telemetry.timestamp.desc()).first()
    item = AssetResponse.model_validate(a)
    _populate_asset_telemetry(item, a, latest_t)
    return item

@router.get("/{asset_id}/telemetry", response_model=List[TelemetryResponse])
def get_asset_telemetry(asset_id: str, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Telemetry).filter(Telemetry.asset_id == asset_id).order_by(Telemetry.timestamp.desc()).limit(limit).all()

@router.get("/{asset_id}/trips", response_model=List[TripResponse])
def get_asset_trips(asset_id: str, db: Session = Depends(get_db)):
    return db.query(Trip).filter(Trip.asset_id == asset_id).order_by(Trip.start_time.desc()).all()

@router.post("/{asset_id}/checkout")
def checkout_asset(asset_id: str, site_id: str, operator_id: str = None, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset.status = "ACTIVE"
    asset.current_site_id = site_id
    if operator_id:
        asset.operator_id = operator_id
    db.commit()
    return {"message": f"Asset {asset_id} checked out to site {site_id} successfully."}
