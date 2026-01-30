"""
Script to clear test users from the database (keeps admin users)
"""
from sqlmodel import Session, select
from database import engine
from models import User, PatientProfile

def clear_test_users():
    with Session(engine) as session:
        # Get all users
        users = session.exec(select(User)).all()
        
        print(f"Found {len(users)} users in database")
        
        # Ask for confirmation
        response = input("Do you want to delete ALL users except admins? (yes/no): ")
        
        if response.lower() != 'yes':
            print("Operation cancelled.")
            return
        
        deleted_count = 0
        for user in users:
            # Keep admin users
            if user.role.value == 'admin':
                print(f"Keeping admin user: {user.email}")
                continue
            
            # Delete patient profiles first (foreign key constraint)
            if user.role.value == 'patient':
                profile = session.exec(
                    select(PatientProfile).where(PatientProfile.user_id == user.id)
                ).first()
                if profile:
                    session.delete(profile)
            
            # Delete user
            print(f"Deleting user: {user.email or user.phone_number} (Role: {user.role})")
            session.delete(user)
            deleted_count += 1
        
        session.commit()
        print(f"\nDeleted {deleted_count} users. Admin users preserved.")

if __name__ == "__main__":
    clear_test_users()
