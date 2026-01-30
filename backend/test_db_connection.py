"""
Test database connection and create tables
"""
from sqlmodel import SQLModel, create_engine, text
from database import DATABASE_URL, engine
from models import User, PatientProfile, DoctorProfile, PharmacistProfile, Medicine, Feedback

print(f"Database URL: {DATABASE_URL[:50]}...")
print("\nTesting connection...")

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()
        print(f"✅ Connected to PostgreSQL: {version[0][:50]}...")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

print("\nCreating tables...")
try:
    SQLModel.metadata.create_all(engine)
    print("✅ Tables created successfully!")
except Exception as e:
    print(f"❌ Table creation failed: {e}")
    exit(1)

print("\nVerifying tables...")
try:
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = result.fetchall()
        if tables:
            print(f"✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"  - {table[0]}")
        else:
            print("❌ No tables found!")
except Exception as e:
    print(f"❌ Verification failed: {e}")

print("\n✅ Database setup complete!")
