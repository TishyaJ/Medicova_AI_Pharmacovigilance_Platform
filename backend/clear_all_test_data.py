"""
Script to clear ALL test data (keeps only admin users)
Run this to start fresh for testing
"""
from sqlmodel import Session, select
from database import engine
from models import User, PatientProfile, Feedback

def clear_all_test_data():
    with Session(engine) as session:
        # Delete all feedback/cases
        cases = session.exec(select(Feedback)).all()
        for case in cases:
            session.delete(case)
        print(f"Deleted {len(cases)} cases")
        
        # Delete all patient profiles
        profiles = session.exec(select(PatientProfile)).all()
        for profile in profiles:
            session.delete(profile)
        print(f"Deleted {len(profiles)} patient profiles")
        
        # Delete all non-admin users
        users = session.exec(select(User)).all()
        deleted_users = 0
        for user in users:
            if user.role.value != 'admin':
                session.delete(user)
                deleted_users += 1
            else:
                print(f"Keeping admin: {user.email}")
        
        print(f"Deleted {deleted_users} non-admin users")
        
        session.commit()
        print("\n✅ Database cleared! Ready for fresh testing.")

if __name__ == "__main__":
    print("Clearing all test data from database...")
    clear_all_test_data()
