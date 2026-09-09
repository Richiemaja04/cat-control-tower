from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime
import random
from app.database import get_db
from app.models.entities import Asset, Site, Alert, Telemetry, Recommendation, EventLog
from app.api.websocket import manager as ws_manager

router = APIRouter(prefix="/demo", tags=["Demo Controls"])

@router.post("/underutilization")
async def trigger_underutilization(db: Session = Depends(get_db)):
    """
    HERO DEMO TRIGGER: Simulates underutilization on EQX1001 (2.0T dumper at S001).
    Carries ~1.0T load, causing 50% capacity utilization.
    Generates Alert and Recommendation.
    """
    asset = db.query(Asset).filter(Asset.id == "EQX1001").first()
    site = db.query(Site).filter(Site.id == "S001").first()
    now = datetime.datetime.utcnow()

    if asset:
        asset.status = "ACTIVE"
        
        # Add alert
        alert = Alert(
            id=f"ALT-{random.randint(1000, 9999)}",
            asset_id="EQX1001",
            type="UNDERUTILIZED",
            severity="MEDIUM",
            observed_value="50% Capacity Util",
            threshold_value="80%",
            explanation="Asset capacity is 2.0T but actual average load is 1.0T/trip (50% utilization). Right-sizing opportunity detected.",
            timestamp=now,
            status="ACTIVE"
        )
        db.add(alert)

        # Check existing recommendation
        existing_rec = db.query(Recommendation).filter(
            Recommendation.asset_id == "EQX1001",
            Recommendation.status == "PENDING"
        ).first()

        if not existing_rec:
            rec = Recommendation(
                id=f"REC-{random.randint(1000, 9999)}",
                asset_id="EQX1001",
                source_site_id="S001",
                destination_site_id="S001",
                recommended_asset_id="EQX1007",
                type="RIGHT_SIZING",
                suitability_score=94.0,
                potential_daily_saving=2850.0,
                what_changed="Site S001 demand is 1.0T/day. Current asset EQX1001 (2.0T capacity) is running at 50% capacity utilization with ₹8,000/day rental cost.",
                why_explanation="EQX1007 (1.0T capacity) perfectly matches 1.0T site requirement, eliminates 5.8 hrs/day idle loss, and costs ₹5,150/day.",
                expected_impact="Capacity utilization increases from 50% → 91%. Idle hours drop from 6.2h → 1.5h/day. Potential daily saving: ₹2,850/day.",
                status="PENDING",
                created_at=now
            )
            db.add(rec)

        db.commit()

        # Broadcast event
        await ws_manager.broadcast({
            "type": "DEMO_SCENARIO_TRIGGERED",
            "scenario": "UNDERUTILIZATION",
            "asset_id": "EQX1001",
            "message": "Demo: Underutilization simulated for EQX1001 (50% capacity utilization). AI recommendation created."
        })

    return {"message": "Underutilization scenario triggered successfully on backend state."}

@router.post("/overload")
async def trigger_overload(db: Session = Depends(get_db)):
    """
    Simulates OVERLOAD on EQX1002 (3.0T excavator at S002 carrying 3.8T).
    """
    asset = db.query(Asset).filter(Asset.id == "EQX1002").first()
    now = datetime.datetime.utcnow()

    if asset:
        asset.status = "AT_RISK"
        alert = Alert(
            id=f"ALT-{random.randint(1000, 9999)}",
            asset_id="EQX1002",
            type="OVERLOAD",
            severity="CRITICAL",
            observed_value="3.8T",
            threshold_value="3.0T",
            explanation="CRITICAL: Asset EQX1002 carrying 3.8T load exceeding certified 3.0T capacity by 26%. High structural failure risk.",
            timestamp=now,
            status="ACTIVE"
        )
        db.add(alert)
        db.commit()

        await ws_manager.broadcast({
            "type": "DEMO_SCENARIO_TRIGGERED",
            "scenario": "OVERLOAD",
            "asset_id": "EQX1002",
            "message": "Demo: Critical Overload simulated on EQX1002 (3.8T / 3.0T capacity)."
        })

    return {"message": "Overload scenario triggered successfully."}

@router.post("/location-anomaly")
async def trigger_location_anomaly(db: Session = Depends(get_db)):
    """
    Simulates Geofence Location Anomaly for asset EQX1006.
    """
    asset = db.query(Asset).filter(Asset.id == "EQX1006").first()
    now = datetime.datetime.utcnow()

    if asset:
        asset.latitude += 0.015  # Move 1.5km away
        asset.longitude += 0.015
        alert = Alert(
            id=f"ALT-{random.randint(1000, 9999)}",
            asset_id="EQX1006",
            type="GEOFENCE_VIOLATION",
            severity="HIGH",
            observed_value="1,850m from site",
            threshold_value="500m radius",
            explanation="GEOFENCE ANOMALY: Asset EQX1006 moved 1,850m outside assigned site geofence.",
            timestamp=now,
            status="ACTIVE"
        )
        db.add(alert)
        db.commit()

        await ws_manager.broadcast({
            "type": "DEMO_SCENARIO_TRIGGERED",
            "scenario": "LOCATION_ANOMALY",
            "asset_id": "EQX1006",
            "message": "Demo: Geofence violation simulated for EQX1006."
        })

    return {"message": "Location anomaly scenario triggered."}

@router.post("/rental-overrun")
async def trigger_rental_overrun(db: Session = Depends(get_db)):
    """
    Simulates Rental Overrun Risk for EQX1002.
    """
    alert = Alert(
        id=f"ALT-{random.randint(1000, 9999)}",
        asset_id="EQX1002",
        type="OVERDUE",
        severity="HIGH",
        observed_value="Expires Tomorrow",
        threshold_value="0 days",
        explanation="Rental period ending tomorrow with 87% overrun probability based on site excavation progress.",
        timestamp=datetime.datetime.utcnow(),
        status="ACTIVE"
    )
    db.add(alert)
    db.commit()

    await ws_manager.broadcast({
        "type": "DEMO_SCENARIO_TRIGGERED",
        "scenario": "RENTAL_OVERRUN",
        "asset_id": "EQX1002",
        "message": "Demo: Rental overrun risk simulated for EQX1002."
    })

    return {"message": "Rental overrun scenario triggered."}
