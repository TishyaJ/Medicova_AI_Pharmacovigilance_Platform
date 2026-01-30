from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from database import get_session
from models import Feedback, User, UserRole, CaseStatus, SeverityLabel

router = APIRouter(prefix="/api/cases", tags=["cases"])

@router.get("/", response_model=List[Feedback])
def get_cases(
    role: UserRole, 
    user_id: int, 
    session: Session = Depends(get_session)
):
    # Role-Based Visibility Logic
    query = select(Feedback)
    
    if role == UserRole.patient:
        # Patient sees only their own cases
        query = query.where(Feedback.user_id == user_id)
    
    elif role == UserRole.doctor:
         # Doctor sees all pending/escalated (could filter by assigned region later)
         # For prototype: Doctor sees everything except closed? Or everything?
         pass 

    elif role == UserRole.pharmacist:
         # Pharmacist might only see relevant cases (e.g. adverse events)
         # For prototype: restricted view
         pass
         
    elif role == UserRole.admin:
        # Admin sees ALL
        pass
        
    cases = session.exec(query).all()
    return cases

@router.post("/")
def create_case(feedback: Feedback, session: Session = Depends(get_session)):
    # Basic AI Severity Check (Mock)
    if "severe" in feedback.symptoms.lower() or "blood" in feedback.symptoms.lower():
        feedback.severity_score = 0.9
        feedback.severity_label = SeverityLabel.strong
        feedback.status = CaseStatus.escalated
    
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback

@router.put("/{case_id}")
def update_case_status(case_id: int, status: CaseStatus, session: Session = Depends(get_session)):
    case = session.get(Feedback, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case.status = status
    session.add(case)
    session.commit()
    session.refresh(case)
    return case
