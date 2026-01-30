from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import User, UserRole, PatientProfile, DoctorProfile, PharmacistProfile

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup")
def signup(user: User, session: Session = Depends(get_session)):
    # Check if user exists
    existing_user = session.exec(select(User).where(User.email == user.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Create empty profile based on role (to be filled later)
    if user.role == UserRole.patient:
        profile = PatientProfile(user_id=user.id)
        session.add(profile)
    elif user.role == UserRole.doctor:
        # Placeholder
        pass
        
    session.commit()
    return user

@router.post("/login")
def login(email: str, password_hash: str, session: Session = Depends(get_session)):
    # Simple Mock Login
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or user.password_hash != password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user
