"""
Update Test User Passwords
Simple script to update existing test user passwords to match expected credentials
"""

import os
from sqlmodel import Session, create_engine, select
from models import User
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in environment variables")

engine = create_engine(DATABASE_URL)

def update_test_passwords():
    """Update passwords for test users"""
    
    test_credentials = {
        "patient@test.com": "patient123",
        "doctor@test.com": "doctor123",
        "pharmacist@test.com": "pharmacist123",
        "admin@test.com": "admin123"
    }
    
    with Session(engine) as session:
        for email, password in test_credentials.items():
            user = session.exec(select(User).where(User.email == email)).first()
            
            if user:
                user.password_hash = password
                session.add(user)
                print(f"✓ Updated password for {email}")
            else:
                print(f"✗ User {email} not found")
        
        session.commit()
        print("\n✅ All test user passwords updated!")
        print("\n📋 Test Credentials:")
        print("=" * 60)
        print("Patient:     patient@test.com / patient123")
        print("Doctor:      doctor@test.com / doctor123")
        print("Pharmacist:  pharmacist@test.com / pharmacist123")
        print("Admin:       admin@test.com / admin123")
        print("=" * 60)

if __name__ == "__main__":
    update_test_passwords()
