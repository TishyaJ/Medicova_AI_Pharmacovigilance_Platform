from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Medicine

router = APIRouter(prefix="/api/medicines", tags=["medicines"])

@router.get("/")
def get_medicines(session: Session = Depends(get_session)):
    medicines = session.exec(select(Medicine)).all()
    return medicines

@router.post("/")
def create_medicine(medicine: Medicine, session: Session = Depends(get_session)):
    session.add(medicine)
    session.commit()
    session.refresh(medicine)
    return medicine

@router.put("/{medicine_id}")
def update_stock(medicine_id: int, stock: int, session: Session = Depends(get_session)):
    medicine = session.get(Medicine, medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    medicine.stock_level = stock
    session.add(medicine)
    session.commit()
    session.refresh(medicine)
    return medicine
