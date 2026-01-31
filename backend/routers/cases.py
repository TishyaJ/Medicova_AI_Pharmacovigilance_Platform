"""
Cases Router - Manages adverse drug reaction case lifecycle

This module handles:
1. Case creation and registration (from web app and WhatsApp bot)
2. Case retrieval and filtering (by user, status, severity)
3. Message/conversation management for each case
4. Severity scoring and risk level assignment
5. Case status updates (pending → under_review → resolved)

Business Logic:
- Each case represents an adverse drug reaction report
- Cases have unique identifiers (MC-YYYY-XXX format)
- Severity is calculated based on symptoms and patient history
- Messages create a conversation thread for doctor-patient communication
- Status transitions: pending → under_review → resolved → closed
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from database import get_session
from models import Feedback, User, UserRole, CaseStatus, SeverityLabel, Message

router = APIRouter(prefix="/api/cases", tags=["cases"])

# ==========================================
# REQUEST/RESPONSE MODELS
# ==========================================

class CaseCreateRequest(BaseModel):
    """
    Case creation request model
    
    Fields:
        medicine_name: Name of the medicine that caused adverse reaction
        symptoms: Description of symptoms/side effects experienced
        user_id: ID of the patient reporting the case
        wizard_data: Optional structured data from case creation wizard
                     (includes dosage, timing, allergies, medical history)
    """
    medicine_name: str
    symptoms: str
    user_id: int
    wizard_data: Optional[dict] = None  # Optional data from the wizard for initial messages

class CaseResponse(BaseModel):
    """Case summary response model for list views"""
    id: int
    case_number: str
    medicine_name: str
    symptoms: str
    status: CaseStatus
    severity_score: float
    severity_label: SeverityLabel
    created_at: datetime
    last_update: str

# ==========================================
# CASE MANAGEMENT ENDPOINTS
# ==========================================

@router.get("/user/{user_id}", response_model=List[CaseResponse])
def get_user_cases(user_id: int, session: Session = Depends(get_session)):
    """
    Retrieve all cases for a specific patient
    
    This endpoint is used by the patient dashboard to display case history.
    Cases are returned in reverse chronological order (newest first).
    
    Args:
        user_id: Patient's user ID
        session: Database session (injected)
        
    Returns:
        List of CaseResponse objects with case summaries
    """
    cases = session.exec(select(Feedback).where(Feedback.user_id == user_id)).all()
    
    response_cases = []
    for case in cases:
        # Generate standardized case number (format: MC-YYYY-XXX)
        case_number = f"MC-{case.created_at.year}-{case.id:03d}"
        
        # Calculate human-readable "last update" time
        # This helps patients understand case activity at a glance
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
    
    # Create initial messages for the case conversation
    # Message 1: System message about case creation
    initial_message = Message(
        case_id=feedback.id,
        sender_id=request.user_id,
        sender_role="system",
        content=f"Case opened. Patient reported side effects from {request.medicine_name}."
    )
    session.add(initial_message)
    
    # Message 2: Patient's registration details (Q&A format)
    if request.wizard_data:
        qa_content = f"**Medicine:** {request.medicine_name}\n**Symptoms:** {request.symptoms}"
        
        # Add additional wizard data if available
        if request.wizard_data.get('severity'):
            qa_content += f"\n**Severity:** {request.wizard_data['severity']}"
        if request.wizard_data.get('duration'):
            qa_content += f"\n**Duration:** {request.wizard_data['duration']}"
        if request.wizard_data.get('dosage'):
            qa_content += f"\n**Dosage:** {request.wizard_data['dosage']}"
            
        patient_details_message = Message(
            case_id=feedback.id,
            sender_id=request.user_id,
            sender_role="patient",
            content=qa_content
        )
        session.add(patient_details_message)
    
    # Message 3: AI-generated summary
    ai_summary = f"AI Analysis: Based on the reported symptoms ({request.symptoms}), this case has been classified as {feedback.severity_label.value} severity (Risk Level {int(feedback.severity_score * 5) + 1}/5). "
    
    if feedback.status == CaseStatus.escalated:
        ai_summary += "This case has been escalated for immediate doctor review due to potentially serious symptoms."
    else:
        ai_summary += "A healthcare professional will review this case shortly."
    
    ai_message = Message(
        case_id=feedback.id,
        sender_id=request.user_id,
        sender_role="system",
        content=ai_summary
    )
    session.add(ai_message)
    
    session.commit()
    
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
    case.status = status
    session.add(case)
    session.commit()
    session.refresh(case)
    return case

# --- Message Endpoints ---

class MessageRequest(BaseModel):
    sender_id: int
    sender_role: str
    content: str

@router.get("/{case_id}/messages")
def get_case_messages(case_id: int, session: Session = Depends(get_session)):
    messages = session.exec(select(Message).where(Message.case_id == case_id).order_by(Message.timestamp)).all()
    return messages

@router.post("/{case_id}/messages")
def send_message(case_id: int, request: MessageRequest, session: Session = Depends(get_session)):
    # Verify case exists
    case = session.get(Feedback, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    message = Message(
        case_id=case_id,
        sender_id=request.sender_id,
        sender_role=request.sender_role,
        content=request.content
    )
    
    session.add(message)
    session.commit()
    session.refresh(message)
    return message
