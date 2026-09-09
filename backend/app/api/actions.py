from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Action

router = APIRouter(prefix="/actions", tags=["Actions"])

@router.get("")
@router.get("/")
def list_actions(db: Session = Depends(get_db)):
    return db.query(Action).order_by(Action.created_at.desc()).all()
