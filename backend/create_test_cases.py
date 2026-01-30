"""
Create test cases for the test user
"""
from sqlmodel import Session
from database import engine
from models import Feedback, CaseStatus, SeverityLabel, SourceType
from datetime import datetime, timedelta

def create_test_cases():
    with Session(engine) as session:
        # Test cases for user ID 1
        cases = [
            Feedback(
                user_id=1,
                medicine_name="Dolo-650",
                symptoms="Skin rash and itching",
                source=SourceType.web,
                status=CaseStatus.pending,
                severity_score=0.6,
                severity_label=SeverityLabel.unexpected,
                created_at=datetime.utcnow() - timedelta(days=2)
            ),
            Feedback(
                user_id=1,
                medicine_name="Augmentin-625",
                symptoms="Nausea and vomiting",
                source=SourceType.web,
                status=CaseStatus.reviewed,
                severity_score=0.4,
                severity_label=SeverityLabel.weak,
                created_at=datetime.utcnow() - timedelta(days=5)
            ),
            Feedback(
                user_id=1,
                medicine_name="Paracetamol",
                symptoms="Mild headache",
                source=SourceType.web,
                status=CaseStatus.reviewed,
                severity_score=0.2,
                severity_label=SeverityLabel.normal,
                created_at=datetime.utcnow() - timedelta(days=10)
            ),
        ]
        
        for case in cases:
            session.add(case)
        
        session.commit()
        
        print(f"✅ Created {len(cases)} test cases for user ID 1")
        print("\nTest cases:")
        for i, case in enumerate(cases, 1):
            print(f"  {i}. {case.medicine_name} - {case.symptoms} ({case.status})")
        
        print("\n✅ Test data ready!")

if __name__ == "__main__":
    create_test_cases()
