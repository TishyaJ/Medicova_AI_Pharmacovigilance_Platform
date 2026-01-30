"""
Script to drop and recreate all database tables with the updated schema
"""
from sqlmodel import SQLModel
from database import engine

def reset_database():
    print("Dropping all tables...")
    SQLModel.metadata.drop_all(engine)
    print("Creating all tables with new schema...")
    SQLModel.metadata.create_all(engine)
    print("Database reset complete!")

if __name__ == "__main__":
    reset_database()
