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

class ProfileUpdateRequest(BaseModel):
    user_id: int
    profile_data: dict

@router.put("/profile/{user_id}")
def update_profile(user_id: int, profile_data: dict, session: Session = Depends(get_session)):
    """Update patient profile"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role != UserRole.patient:
        raise HTTPException(status_code=400, detail="Only patient profiles can be updated via this endpoint")
    
    # Get or create patient profile
    profile = session.exec(select(PatientProfile).where(PatientProfile.user_id == user_id)).first()
    
    if not profile:
        profile = PatientProfile(user_id=user_id)
        session.add(profile)
    
    # Update basic demographics
    if 'age' in profile_data:
        profile.age = profile_data['age']
    if 'gender' in profile_data:
        profile.gender = profile_data['gender']
    if 'pin_code' in profile_data:
        profile.pin_code = profile_data['pin_code']
    if 'location' in profile_data:
        profile.location = profile_data['location']
    if 'is_pregnant' in profile_data:
        profile.is_pregnant = profile_data['is_pregnant']
    if 'is_breastfeeding' in profile_data:
        profile.is_breastfeeding = profile_data['is_breastfeeding']
    
    # Update physical attributes
    if 'blood_group' in profile_data:
        profile.blood_group = profile_data['blood_group']
    if 'height' in profile_data:
        profile.height = profile_data['height']
    if 'weight' in profile_data:
        profile.weight = profile_data['weight']
    
    # Update medical history
    if 'abha_id' in profile_data:
        profile.abha_id = profile_data['abha_id']
    if 'allergies' in profile_data:
        # Convert list to JSON string
        profile.allergies = json.dumps(profile_data['allergies']) if isinstance(profile_data['allergies'], list) else profile_data['allergies']
    if 'medical_conditions' in profile_data:
        # Convert list to JSON string
        profile.medical_conditions = json.dumps(profile_data['medical_conditions']) if isinstance(profile_data['medical_conditions'], list) else profile_data['medical_conditions']
    if 'current_medicines' in profile_data:
        profile.current_medicines = profile_data['current_medicines']
    if 'current_medicine_details' in profile_data:
        profile.current_medicine_details = profile_data['current_medicine_details']
    
    # Update emergency contact
    if 'emergency_contact_name' in profile_data:
        profile.emergency_contact_name = profile_data['emergency_contact_name']
    if 'emergency_contact_relation' in profile_data:
        profile.emergency_contact_relation = profile_data['emergency_contact_relation']
    if 'emergency_contact_phone' in profile_data:
        profile.emergency_contact_phone = profile_data['emergency_contact_phone']
    
    # Update language and consent
    if 'language' in profile_data:
        profile.language = profile_data['language']
    if 'consent' in profile_data:
        profile.consent = profile_data['consent']
    
    # Mark profile as complete if key fields are filled
    if profile.age and profile.gender and profile.pin_code:
        profile.profile_complete = True
    
    session.commit()
    session.refresh(profile)
    
    return {"message": "Profile updated successfully", "profile_complete": profile.profile_complete}
