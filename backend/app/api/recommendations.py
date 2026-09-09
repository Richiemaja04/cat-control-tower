from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random
import datetime
from app.database import get_db
from app.models.entities import Recommendation, Action, Feedback, Asset, Site, EventLog
from app.schemas.schemas import RecommendationResponse, ActionApproveRequest, ActionRejectRequest

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
@router.get("/", response_model=List[RecommendationResponse])
def list_recommendations(db: Session = Depends(get_db)):
    return db.query(Recommendation).order_by(Recommendation.created_at.desc()).all()

@router.post("/{id}/approve")
def approve_recommendation(id: str, body: ActionApproveRequest = None, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = "APPROVED"
    now = datetime.datetime.utcnow()

    # Asset to be reassigned (either target recommended asset or source asset)
    target_asset_id = rec.recommended_asset_id if rec.recommended_asset_id else rec.asset_id
    asset = db.query(Asset).filter(Asset.id == target_asset_id).first()

    if asset:
        asset.status = "TRANSITIONING"

    # Create Action Record
    act_id = f"ACT-{random.randint(1000, 9999)}"
    action = Action(
        id=act_id,
        recommendation_id=rec.id,
        asset_id=target_asset_id,
        source_site_id=rec.source_site_id,
        destination_site_id=rec.destination_site_id,
        action_type="REASSIGNMENT",
        status="TRANSITIONING",
        scheduled_time=now,
        before_utilization=50.0,
        before_cost=asset.daily_rental_rate if asset else 8000.0,
        created_at=now
    )
    db.add(action)

    # Record Feedback
    fb = Feedback(
        id=f"FB-{random.randint(1000, 9999)}",
        recommendation_id=rec.id,
        decision="APPROVED",
        operator_notes=body.operator_notes if body else "Approved by Control Tower Operator",
        timestamp=now
    )
    db.add(fb)

    # Event log
    el = EventLog(
        event_type="RECOMMENDATION_APPROVED",
        entity_type="RECOMMENDATION",
        entity_id=rec.id,
        message=f"Operator APPROVED recommendation {rec.id} ({rec.type}). Scheduled reassignment for asset {target_asset_id}.",
        metadata_json={"action_id": act_id, "notes": body.operator_notes if body else ""}
    )
    db.add(el)

    db.commit()
    return {
        "message": f"Recommendation {id} APPROVED. Action {act_id} scheduled and asset transition initiated.",
        "action_id": act_id,
        "asset_id": target_asset_id,
        "status": "TRANSITIONING"
    }

@router.post("/{id}/reject")
def reject_recommendation(id: str, body: ActionRejectRequest, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = "REJECTED"
    now = datetime.datetime.utcnow()

    # Record Feedback with rejection reason
    fb = Feedback(
        id=f"FB-{random.randint(1000, 9999)}",
        recommendation_id=rec.id,
        decision="REJECTED",
        rejection_reason=body.rejection_reason,
        operator_notes=body.operator_notes,
        timestamp=now
    )
    db.add(fb)

    db.commit()
    return {
        "message": f"Recommendation {id} REJECTED with reason: '{body.rejection_reason}'. Feedback logged for continuous learning."
    }
