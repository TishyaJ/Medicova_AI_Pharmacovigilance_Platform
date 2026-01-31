"""
Debug Test User Passwords
Check what passwords are actually stored in the database
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

def check_passwords():
    """Check stored passwords for test users"""
    
    test_emails = [
        "patient@test.com",
        "doctor@test.com",
        "pharmacist@test.com",
        "admin@test.com"
    ]
    
    with Session(engine) as session:
        print("\n📋 Current Password Hashes in Database:")
        print("=" * 80)
        
        for email in test_emails:
            user = session.exec(select(User).where(User.email == email)).first()
            
            if user:
                print(f"{email:30} | Password: '{user.password_hash}'")
            else:
                print(f"{email:30} | NOT FOUND")
        
        print("=" * 80)
        print("\n💡 Expected passwords:")
        print("   patient@test.com    -> 'patient123'")
        print("   doctor@test.com     -> 'doctor123'")
        print("   pharmacist@test.com -> 'pharmacist123'")
        print("   admin@test.com      -> 'admin123'")

if __name__ == "__main__":
    check_passwords()
