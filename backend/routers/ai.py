from fastapi import APIRouter
from pydantic import BaseModel
from models import SeverityLabel

router = APIRouter(prefix="/api/ai", tags=["ai"])

class SymptomAnalysisRequest(BaseModel):
    text: str

class SymptomAnalysisResponse(BaseModel):
    severity_score: float
    severity_label: SeverityLabel

@router.post("/analyze", response_model=SymptomAnalysisResponse)
async def analyze_symptom(request: SymptomAnalysisRequest):
    # TODO: Replace with real AI model (HuggingFace/PyTorch)
    # Simple rule-based logic for prototype
    text_lower = request.text.lower()
    
    score = 0.1
    label = SeverityLabel.normal
    
    strong_keywords = ["severe", "agony", "unbearable", "emergency", "blood", "fainted"]
    weak_keywords = ["mild", "slightly", "little", "annoying"]
    
    if any(k in text_lower for k in strong_keywords):
        score = 0.9
        label = SeverityLabel.strong
    elif any(k in text_lower for k in weak_keywords):
        score = 0.3
        label = SeverityLabel.weak
    elif "unexpected" in text_lower or "weird" in text_lower:
        score = 0.7
        label = SeverityLabel.unexpected
        
    return SymptomAnalysisResponse(severity_score=score, severity_label=label)
