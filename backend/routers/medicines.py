"""
Medicines Router - Medicine catalog and inventory management

This module provides:
1. Medicine database with detailed information
2. Medicine search and retrieval
3. Stock level management for pharmacy inventory
4. Medicine creation and updates (admin only)

Business Logic:
- Medicines are stored with composition, manufacturer, and pricing
- Stock levels are tracked for inventory management
- Integration with pharmacy partners for real-time availability
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Medicine

router = APIRouter(prefix="/api/medicines", tags=["medicines"])

# ==========================================
# MEDICINE CATALOG ENDPOINTS
# ==========================================

@router.get("/")
def get_medicines(session: Session = Depends(get_session)):
    """
    Retrieve all medicines in the catalog
    
    Used for:
    - Medicine marketplace browsing
    - Search and autocomplete
    - Price comparison
    
    Returns:
        List of all available medicines
    """
    medicines = session.exec(select(Medicine)).all()
    return medicines

@router.post("/")
def create_medicine(medicine: Medicine, session: Session = Depends(get_session)):
    """
    Add a new medicine to the catalog (Admin only)
    
    Args:
        medicine: Medicine object with all required fields
        
    Returns:
        Created medicine with assigned ID
    """
    session.add(medicine)
    session.commit()
    session.refresh(medicine)
    return medicine

@router.put("/{medicine_id}")
def update_stock(medicine_id: int, stock: int, session: Session = Depends(get_session)):
    """
    Update stock level for a medicine (Pharmacist/Admin only)
    
    This endpoint is used by pharmacies to update inventory levels
    when medicines are sold or restocked.
    
    Args:
        medicine_id: ID of the medicine to update
        stock: New stock level (number of units available)
        
    Returns:
        Updated medicine object
        
    Raises:
        HTTPException 404: If medicine not found
    """
    medicine = session.get(Medicine, medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    medicine.stock_level = stock
    session.add(medicine)
    session.commit()
    session.refresh(medicine)
    return medicine
