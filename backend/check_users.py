"""
Script to check existing users in the database
"""
from sqlmodel import Session, select
from database import engine
from models import User

def check_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        
        if not users:
            print("No users found in database.")
        else:
            print(f"Found {len(users)} users:")
            print("-" * 80)
            for user in users:
                print(f"ID: {user.id}")
                print(f"Name: {user.full_name}")
                print(f"Email: {user.email}")
                print(f"Phone: {user.phone_number}")
                print(f"Role: {user.role}")
                print(f"Created: {user.created_at}")
                print("-" * 80)

if __name__ == "__main__":
    check_users()
