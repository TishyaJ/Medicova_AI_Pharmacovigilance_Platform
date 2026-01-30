from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from database import get_session
from models import Feedback, User, UserRole, CaseStatus, SeverityLabel

router = APIRouter(prefix="/api/cases", tags=["cases"])

class CaseCreateRequest(BaseModel):
    medicine_name: str
    symptoms: str
    user_id: int

class CaseResponse(BaseModel):
    id: int
    case_number: str
    medicine_name: str
    symptoms: str
    status: CaseStatus
    severity_score: float
    severity_label: SeverityLabel
    created_at: datetime
    last_update: str

@router.get("/user/{user_id}", response_model=List[CaseResponse])
def get_user_cases(user_id: int, session: Session = Depends(get_session)):
    """Get all cases for a specific user (patient)"""
    cases = session.exec(select(Feedback).where(Feedback.user_id == user_id)).all()
    
    response_cases = []
    for case in cases:
        # Generate case number
        case_number = f"MC-{case.created_at.year}-{case.id:03d}"
        
        # Calculate last update (mock for now)
        time_diff = datetime.utcnow() - case.created_at
        if time_diff.days > 0:
            last_update = f"{time_diff.days} days ago"
        elif time_diff.seconds > 3600:
            hours = time_diff.seconds // 3600
            last_update = f"{hours} hours ago"
        else:
            minutes = time_diff.seconds // 60
            last_update = f"{minutes} minutes ago"
        
        response_cases.append(CaseResponse(
            id=case.id,
            case_number=case_number,
            medicine_name=case.medicine_name,
            symptoms=case.symptoms,
            status=case.status,
            severity_score=case.severity_score,
            severity_label=case.severity_label,
            created_at=case.created_at,
            last_update=last_update
        ))
    
    return response_cases

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
def create_case(request: CaseCreateRequest, session: Session = Depends(get_session)):
    # Create feedback case
    feedback = Feedback(
        user_id=request.user_id,
        medicine_name=request.medicine_name,
        symptoms=request.symptoms
    )
    
    # Basic AI Severity Check (Mock)
    symptoms_lower = request.symptoms.lower()
    if any(keyword in symptoms_lower for keyword in ["severe", "blood", "breathing", "chest pain", "unconscious"]):
        feedback.severity_score = 0.9
        feedback.severity_label = SeverityLabel.strong
        feedback.status = CaseStatus.escalated
    elif any(keyword in symptoms_lower for keyword in ["mild", "slight", "minor"]):
        feedback.severity_score = 0.2
        feedback.severity_label = SeverityLabel.weak
        feedback.status = CaseStatus.pending
    else:
        feedback.severity_score = 0.5
        feedback.severity_label = SeverityLabel.unexpected
        feedback.status = CaseStatus.pending
    
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    
    # Generate case number for response
    case_number = f"MC-{feedback.created_at.year}-{feedback.id:03d}"
    
    return {
        "id": feedback.id,
        "case_number": case_number,
        "message": "Case created successfully",
        "status": feedback.status,
        "severity_level": int(feedback.severity_score * 5) + 1  # Convert to 1-5 scale
    }

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
