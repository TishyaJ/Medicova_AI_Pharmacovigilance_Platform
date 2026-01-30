"""
Migration script to update sender_role column type in message table
"""
from sqlmodel import Session, create_engine, text
from database import engine

def migrate_message_sender_role():
    """Update sender_role column to accept any string value"""
    
    migrations = [
        # Drop the existing enum constraint if it exists
        "ALTER TABLE message ALTER COLUMN sender_role TYPE VARCHAR",
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
    print("Starting Message sender_role migration...")
    migrate_message_sender_role()
