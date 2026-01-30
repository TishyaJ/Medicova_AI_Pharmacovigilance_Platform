"""
Migration script to add new columns to PatientProfile table
Run this once to update the database schema
"""
from sqlmodel import Session, create_engine, text
from database import engine

def migrate_patient_profile():
    """Add new columns to patientprofile table"""
    
    migrations = [
        "ALTER TABLE patientprofile ADD COLUMN IF NOT EXISTS location VARCHAR",
        "ALTER TABLE patientprofile ADD COLUMN IF NOT EXISTS blood_group VARCHAR",
        "ALTER TABLE patientprofile ADD COLUMN IF NOT EXISTS height VARCHAR",
        "ALTER TABLE patientprofile ADD COLUMN IF NOT EXISTS weight VARCHAR",
        "ALTER TABLE patientprofile ADD COLUMN IF NOT EXISTS allergies TEXT",
        "ALTER TABLE patientprofile ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR",
        "ALTER TABLE patientprofile ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR",
        "ALTER TABLE patientprofile ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR",
    ]
    
    with Session(engine) as session:
        for migration in migrations:
            try:
                session.exec(text(migration))
                print(f"✓ Executed: {migration}")
            except Exception as e:
                print(f"✗ Error: {migration}")
                print(f"  {str(e)}")
        
        session.commit()
        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    print("Starting PatientProfile migration...")
    migrate_patient_profile()
