from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum
from datetime import datetime

# --- Enums ---
class UserRole(str, Enum):
    patient = "patient"
    doctor = "doctor"
    pharmacist = "pharmacist"
    admin = "admin"

class SourceType(str, Enum):
    web = "web"
    whatsapp = "whatsapp"

class SeverityLabel(str, Enum):
    strong = "strong"  # High Risk (Red)
    weak = "weak"      # Low Risk (Green)
    unexpected = "unexpected" # Anomaly (Yellow)
    normal = "normal"

class CaseStatus(str, Enum):
    pending = "pending"
    escalated = "escalated"
    reviewed = "reviewed"

# --- Core User Table ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=True) # Optional for WhatsApp users
    password_hash: Optional[str] = None # Optional for WhatsApp users
    role: UserRole
    phone_number: str = Field(index=True, unique=True) # Primary Key for WhatsApp integration
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    patient_profile: Optional["PatientProfile"] = Relationship(back_populates="user")
    doctor_profile: Optional["DoctorProfile"] = Relationship(back_populates="user")
    pharmacist_profile: Optional["PharmacistProfile"] = Relationship(back_populates="user")
    feedback_cases: List["Feedback"] = Relationship(back_populates="user")

# --- Role Specific Profiles ---
class PatientProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    # Basic Demographics
    age: Optional[str] = None  # Age range like "19-40"
    gender: Optional[str] = None
    is_pregnant: Optional[bool] = None
    is_breastfeeding: Optional[bool] = None
    pin_code: Optional[str] = None
    location: Optional[str] = None  # City, State
    
    # Physical Attributes
    blood_group: Optional[str] = None  # A+, B+, O-, etc.
    height: Optional[str] = None  # in cm
    weight: Optional[str] = None  # in kg
    
    # Medical History
    drug_allergies: Optional[bool] = None
    allergy_details: Optional[str] = None
    food_allergies: Optional[bool] = None
    food_allergy_details: Optional[str] = None
    allergies: Optional[str] = None  # JSON array of all allergies
    medical_conditions: Optional[str] = None  # JSON string of conditions array
    abha_id: Optional[str] = None
    current_medicines: Optional[bool] = None
    current_medicine_details: Optional[str] = None
    
    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    
    # Profile Completion
    language: Optional[str] = None
    consent: Optional[bool] = None
    profile_complete: bool = Field(default=False)
    
    user: Optional[User] = Relationship(back_populates="patient_profile")

class DoctorProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    medical_license_id: str
    specialization: str
    user: Optional[User] = Relationship(back_populates="doctor_profile")

class PharmacistProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    pharmacy_license_id: str
    shop_name: str
    user: Optional[User] = Relationship(back_populates="pharmacist_profile")

# --- Inventory & Medicine ---
class Medicine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    stock_level: int = Field(default=0)
    
    # AI/Knowledge Base Fields
    known_side_effects: Optional[str] = None # CSV or JSON string
    common_effects: Optional[str] = None

# --- Main Case/Feedback Table ---
class Feedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(foreign_key="user.id")
    
    medicine_name: str # Can be free text if not linked to Medicine ID yet
    symptoms: str
    
    source: SourceType = Field(default=SourceType.web)
    status: CaseStatus = Field(default=CaseStatus.pending)
    
    # AI Analysis Fields
    severity_score: float = Field(default=0.0)
    severity_label: SeverityLabel = Field(default=SeverityLabel.normal)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: Optional[User] = Relationship(back_populates="feedback_cases")
    messages: List["Message"] = Relationship(back_populates="case")

# --- Chat/Messages ---
class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    case_id: int = Field(foreign_key="feedback.id")
    sender_id: int # User ID of sender
    sender_role: str # patient, doctor, pharmacist, admin, or system
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Optional attachment support for later
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None # image, pdf, etc.
    
    case: Optional[Feedback] = Relationship(back_populates="messages")
