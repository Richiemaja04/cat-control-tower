from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Rental, Asset, Customer, Site, Operator

router = APIRouter(prefix="/rentals", tags=["Rentals"])

@router.get("")
@router.get("/")
def list_rentals(db: Session = Depends(get_db)):
    rentals = db.query(Rental).all()
    results = []
    for r in rentals:
        asset = db.query(Asset).filter(Asset.id == r.asset_id).first()
        customer = db.query(Customer).filter(Customer.id == r.customer_id).first() if r.customer_id else None
        site = db.query(Site).filter(Site.id == r.site_id).first() if r.site_id else None
        
        operator = None
        if asset and asset.operator_id:
            operator = db.query(Operator).filter(Operator.id == asset.operator_id).first()

        results.append({
            "id": r.id,
            "asset_id": r.asset_id,
            "asset_name": asset.name if asset else "Unknown",
            "site_id": r.site_id,
            "site_name": site.name if site else "Unknown",
            "customer_name": customer.name if customer else "InfraCorp Constructions",
            "operator_id": asset.operator_id if asset else None,
            "operator_name": operator.name if operator else None,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "daily_rate": r.daily_rate,
            "status": r.status,
            "extension_risk_probability": r.extension_risk_probability,
            "expected_overrun_duration_days": 3 if (r.extension_risk_probability or 0) > 0.5 else 0,
            "potential_saving": 0.0
        })
    return results

@router.get("/risk")
def get_rental_risk(db: Session = Depends(get_db)):
    rentals = db.query(Rental).filter(Rental.extension_risk_probability > 0.4).all()
    results = []
    for r in rentals:
        asset = db.query(Asset).filter(Asset.id == r.asset_id).first()
        site = db.query(Site).filter(Site.id == r.site_id).first()
        operator = db.query(Operator).filter(Operator.id == asset.operator_id).first() if (asset and asset.operator_id) else None
        results.append({
            "rental_id": r.id,
            "asset_id": r.asset_id,
            "asset_name": asset.name if asset else "",
            "site_name": site.name if site else "",
            "operator_id": asset.operator_id if asset else None,
            "operator_name": operator.name if operator else None,
            "end_date": r.end_date,
            "extension_probability": r.extension_risk_probability,
            "recommended_action": "Replace with candidate asset before rental end to optimize utilization",
            "estimated_cost_diff": 0.0
        })
    return results
