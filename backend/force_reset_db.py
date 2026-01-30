"""
Force reset database - drops ALL tables and recreates with new schema
WARNING: This will delete ALL data!
"""
from sqlmodel import SQLModel, text
from database import engine

def force_reset_database():
    print("⚠️  WARNING: This will DELETE ALL DATA in the database!")
    print("Dropping all tables...")
    
    # Drop all tables using raw SQL to avoid schema issues
    with engine.begin() as conn:
        # Drop tables in correct order (respecting foreign keys)
        conn.execute(text("DROP TABLE IF EXISTS feedback CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS patientprofile CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS doctorprofile CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS pharmacistprofile CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS medicine CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS \"user\" CASCADE"))
        
        # Drop enums
        conn.execute(text("DROP TYPE IF EXISTS userrole CASCADE"))
        conn.execute(text("DROP TYPE IF EXISTS sourcetype CASCADE"))
        conn.execute(text("DROP TYPE IF EXISTS casestatus CASCADE"))
        conn.execute(text("DROP TYPE IF EXISTS severitylabel CASCADE"))
    
    print("✅ All tables dropped successfully!")
    print("Creating new tables with updated schema...")
    
    # Create all tables with new schema
    SQLModel.metadata.create_all(engine)
    
    print("✅ Database reset complete with new schema!")
    print("\nYou can now register new users.")

if __name__ == "__main__":
    force_reset_database()
