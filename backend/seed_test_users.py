"""
Seed Database with Test Credentials
Creates test users for all roles to facilitate evaluation and testing
"""

import os
from sqlmodel import Session, create_engine, select
from models import User, UserRole, PatientProfile, DoctorProfile, PharmacistProfile
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in environment variables")

engine = create_engine(DATABASE_URL)

def create_test_users():
    """Create test users for all roles with predefined credentials"""
    
    with Session(engine) as session:
        # Test credentials from README
        test_users = [
            {
                "email": "patient@test.com",
                "password_hash": "patient123",  # In production, this would be hashed
                "role": UserRole.patient,
                "phone_number": "+919876543210",
                "full_name": "Test Patient",
                "profile_data": {
                    "age": 35,
                    "gender": "Male",
                    "location": "Mumbai, Maharashtra",
                    "pin_code": "400001",
                    "medical_conditions": ["Hypertension", "Diabetes"],
                    "allergies": ["Penicillin", "Sulfa drugs"],
                    "emergency_contact": "+919876543211",
                    "blood_group": "O+",
                    "profile_complete": True
                }
            },
            {
                "email": "doctor@test.com",
                "password_hash": "doctor123",
                "role": UserRole.doctor,
                "phone_number": "+919876543220",
                "full_name": "Dr. Test Doctor",
                "profile_data": {
                    "specialization": "Internal Medicine",
                    "license_number": "MH-DOC-12345",
                    "years_of_experience": 10,
                    "hospital_affiliation": "Apollo Hospital Mumbai"
                }
            },
            {
                "email": "pharmacist@test.com",
                "password_hash": "pharmacist123",
                "role": UserRole.pharmacist,
                "phone_number": "+919876543230",
                "full_name": "Test Pharmacist",
                "profile_data": {
                    "pharmacy_name": "MediPlus Pharmacy",
                    "license_number": "MH-PHARM-67890",
                    "location": "Andheri, Mumbai",
                    "registration_year": 2015
                }
            },
            {
                "email": "admin@test.com",
                "password_hash": "admin123",
                "role": UserRole.admin,
                "phone_number": "+919876543240",
                "full_name": "Admin User",
                "profile_data": {}
            }
        ]
        
        for user_data in test_users:
            # Check if user already exists
            existing_user = session.exec(
                select(User).where(User.email == user_data["email"])
            ).first()
            
            if existing_user:
                print(f"✓ User {user_data['email']} already exists")
                continue
            
            # Create user
            user = User(
                email=user_data["email"],
                password_hash=user_data["password_hash"],
                role=user_data["role"],
                phone_number=user_data["phone_number"],
                full_name=user_data["full_name"]
            )
            
            session.add(user)
            session.commit()
            session.refresh(user)
            
            # Create role-specific profile
            profile_data = user_data["profile_data"]
            
            if user.role == UserRole.patient:
                profile = PatientProfile(
                    user_id=user.id,
                    age=str(profile_data.get("age", "")),  # age is stored as string
                    gender=profile_data.get("gender"),
                    location=profile_data.get("location"),
                    pin_code=profile_data.get("pin_code"),
                    emergency_contact=profile_data.get("emergency_contact"),
                    blood_group=profile_data.get("blood_group"),
                    profile_complete=profile_data.get("profile_complete", False)
                )
                session.add(profile)
                
            elif user.role == UserRole.doctor:
                profile = DoctorProfile(
                    user_id=user.id,
                    specialization=profile_data.get("specialization"),
                    license_number=profile_data.get("license_number"),
                    years_of_experience=profile_data.get("years_of_experience"),
                    hospital_affiliation=profile_data.get("hospital_affiliation")
                )
                session.add(profile)
                
            elif user.role == UserRole.pharmacist:
                profile = PharmacistProfile(
                    user_id=user.id,
                    pharmacy_name=profile_data.get("pharmacy_name"),
                    license_number=profile_data.get("license_number"),
                    location=profile_data.get("location"),
                    registration_year=profile_data.get("registration_year")
                )
                session.add(profile)
            
            session.commit()
            print(f"✓ Created user: {user_data['email']} ({user_data['role']})")
        
        print("\n✅ Test credentials setup complete!")
        print("\n📋 Test Credentials:")
        print("=" * 60)
        print("Patient:     patient@test.com / patient123")
        print("Doctor:      doctor@test.com / doctor123")
        print("Pharmacist:  pharmacist@test.com / pharmacist123")
        print("Admin:       admin@test.com / admin123")
        print("=" * 60)

if __name__ == "__main__":
    create_test_users()
