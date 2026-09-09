from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random
import datetime
from app.database import get_db
from app.models.entities import Site, DemandRequest
from app.schemas.schemas import SiteResponse, DemandRequestCreate, DemandRequestResponse

router = APIRouter(prefix="/sites", tags=["Sites"])

@router.get("", response_model=List[SiteResponse])
@router.get("/", response_model=List[SiteResponse])
def list_sites(db: Session = Depends(get_db)):
    return db.query(Site).all()

@router.get("/{site_id}", response_model=SiteResponse)
def get_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.post("/demand-requests", response_model=DemandRequestResponse)
def create_demand_request(req: DemandRequestCreate, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == req.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    # Update site demand
    site.current_demand_tons_per_day = req.required_quantity_tons_per_day
    
    dr = DemandRequest(
        id=f"REQ-{random.randint(1000, 9999)}",
        site_id=req.site_id,
        material=req.material,
        required_quantity_tons_per_day=req.required_quantity_tons_per_day,
        trips_per_day=req.trips_per_day,
        terrain=req.terrain,
        operating_hours=req.operating_hours,
        duration_days=req.duration_days,
        status="PENDING",
        created_at=datetime.datetime.utcnow()
    )
    db.add(dr)
    db.commit()
    db.refresh(dr)
    return dr
