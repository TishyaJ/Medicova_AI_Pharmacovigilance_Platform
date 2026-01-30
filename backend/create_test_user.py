"""
Create a test patient user with complete profile
"""
from sqlmodel import Session
from database import engine
from models import User, UserRole, PatientProfile
import json

def create_test_user():
    with Session(engine) as session:
        # Create test patient user
        user = User(
            email="test@example.com",
            password_hash="test123",
            role=UserRole.patient,
            phone_number="9876543210",
            full_name="Test Patient"
        )
        
        session.add(user)
        session.commit()
        session.refresh(user)
        
        print(f"✅ Created user: {user.full_name} (ID: {user.id})")
        
        # Create patient profile
        profile = PatientProfile(
            user_id=user.id,
            age="19-40",
            gender="Male",
            pin_code="123456",
            language="english",
            consent=True,
            medical_conditions=json.dumps(["Diabetes"]),
            profile_complete=True
        )
        
        session.add(profile)
        session.commit()
        
        print(f"✅ Created patient profile for user {user.id}")
        print(f"\n📧 Email: test@example.com")
        print(f"🔑 Password: test123")
        print(f"📱 Phone: 9876543210")
        print(f"\n✅ Test user ready for login!")

if __name__ == "__main__":
    create_test_user()
