from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List
import json
from database import get_session
from models import User, UserRole, PatientProfile, DoctorProfile, PharmacistProfile

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignupRequest(BaseModel):
    phone_number: str
    role: UserRole
    full_name: str
    email: str
    password_hash: str
    # Patient profile data (optional, only for patients)
    profile_data: Optional[dict] = None

class LoginRequest(BaseModel):
    email: str
    password_hash: str

@router.post("/signup")
def signup(request: SignupRequest, session: Session = Depends(get_session)):
    # Check if user exists by email or phone
    existing_user = session.exec(
        select(User).where(
            (User.email == request.email) | (User.phone_number == request.phone_number)
        )
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or phone number already registered")
    
    # Create user
    user = User(
        email=request.email,
        password_hash=request.password_hash,
        role=request.role,
        phone_number=request.phone_number,
        full_name=request.full_name
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Create role-specific profile
    if user.role == UserRole.patient and request.profile_data:
        profile_data = request.profile_data
        
        # Convert medical conditions list to JSON string
        medical_conditions_json = None
        if profile_data.get('medicalConditions'):
            medical_conditions_json = json.dumps(profile_data['medicalConditions'])
        
        profile = PatientProfile(
            user_id=user.id,
            age=profile_data.get('age'),
            gender=profile_data.get('gender'),
            is_pregnant=profile_data.get('isPregnant'),
            is_breastfeeding=profile_data.get('isBreastfeeding'),
            pin_code=profile_data.get('pinCode'),
            drug_allergies=profile_data.get('drugAllergies'),
            allergy_details=profile_data.get('allergyDetails'),
            food_allergies=profile_data.get('foodAllergies'),
            food_allergy_details=profile_data.get('foodAllergyDetails'),
            medical_conditions=medical_conditions_json,
            abha_id=profile_data.get('abhaId'),
            current_medicines=profile_data.get('currentMedicines'),
            current_medicine_details=profile_data.get('currentMedicineDetails'),
            language=profile_data.get('language'),
            consent=profile_data.get('consent'),
            profile_complete=True
        )
        session.add(profile)
    elif user.role == UserRole.patient:
        # Create empty profile for patients without profile data
        profile = PatientProfile(user_id=user.id, profile_complete=False)
        session.add(profile)
    elif user.role == UserRole.doctor:
        # Create doctor profile (you can extend this later)
        pass
    elif user.role == UserRole.pharmacist:
        # Create pharmacist profile (you can extend this later)
        pass
        
    session.commit()
    return {"message": "User created successfully", "user_id": user.id, "role": user.role}

@router.post("/login")
def login(request: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == request.email)).first()
    if not user or user.password_hash != request.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get profile data for patients
    profile_data = None
    if user.role == UserRole.patient:
        profile = session.exec(select(PatientProfile).where(PatientProfile.user_id == user.id)).first()
        if profile:
            profile_data = {
                "age": profile.age,
                "gender": profile.gender,
                "pin_code": profile.pin_code,
                "profile_complete": profile.profile_complete,
                "language": profile.language,
                "medical_conditions": json.loads(profile.medical_conditions) if profile.medical_conditions else []
            }
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "phone_number": user.phone_number
        },
        "profile": profile_data
    }
