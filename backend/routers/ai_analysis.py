"""
FastAPI Router for AI Analysis Endpoints
Integrates Gemini-based AI engine with Medicova backend
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import tempfile
from ai_engine import MedicovaAIEngine, RiskAssessment, VisionAnalysis

router = APIRouter(prefix="/api/ai", tags=["AI Analysis"])

# Initialize AI engine (singleton pattern)
try:
    ai_engine = MedicovaAIEngine()
except ValueError as e:
    print(f"⚠️ AI Engine not initialized: {e}")
    ai_engine = None


# ==========================================
# REQUEST/RESPONSE MODELS
# ==========================================

class TriageRequest(BaseModel):
    patient_text: str
    patient_age: int
    patient_gender: str = "Unknown"
    medical_history: Optional[List[str]] = None


class TriageResponse(BaseModel):
    risk_level: int
    reasoning: str
    entities: List[str]
    missing_batch_id: bool
    confidence: float
    timestamp: str


class VisionResponse(BaseModel):
    medicine_name: Optional[str]
    batch_no: Optional[str]
    expiry_date: Optional[str]
    packaging_condition: str
    confidence: float
    timestamp: str


class FollowUpRequest(BaseModel):
    medicine: str
    symptoms: str
    risk_level: int
    missing_fields: List[str]


# ==========================================
# ENDPOINTS
# ==========================================

@router.post("/analyze-triage", response_model=TriageResponse)
async def analyze_triage(request: TriageRequest):
    """
    Analyze patient report and assign risk level
    
    **Use Case**: Called when patient submits case via web or WhatsApp
    
    **Example Request:**
    ```json
    {
        "patient_text": "I have severe chest pain after taking Aspirin",
        "patient_age": 55,
        "patient_gender": "Male",
        "medical_history": ["Hypertension", "Diabetes"]
    }
    ```
    
    **Returns**: Risk level (1-5), extracted entities, reasoning
    """
    if not ai_engine:
        raise HTTPException(
            status_code=503, 
            detail="AI Engine not available. Set GEMINI_API_KEY environment variable."
        )
    
    try:
        result = ai_engine.analyze_risk_triage(
            patient_text=request.patient_text,
            patient_age=request.patient_age,
            patient_gender=request.patient_gender,
            medical_history=request.medical_history
        )
        
        return TriageResponse(
            risk_level=result.risk_level,
            reasoning=result.reasoning,
            entities=result.entities,
            missing_batch_id=result.missing_batch_id,
            confidence=result.confidence,
            timestamp=result.timestamp
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@router.post("/analyze-vision", response_model=VisionResponse)
async def analyze_vision(file: UploadFile = File(...)):
    """
    Analyze medicine packaging image
    
    **Use Case**: Called when patient uploads evidence photo
    
    **Accepts**: JPEG, PNG images
    **Returns**: Extracted batch number, expiry date, medicine name
    """
    if not ai_engine:
        raise HTTPException(
            status_code=503,
            detail="AI Engine not available. Set GEMINI_API_KEY environment variable."
        )
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        # Analyze image
        result = ai_engine.analyze_vision_evidence(tmp_path)
        
        # Clean up temp file
        os.unlink(tmp_path)
        
        return VisionResponse(
            medicine_name=result.medicine_name,
            batch_no=result.batch_no,
            expiry_date=result.expiry_date,
            packaging_condition=result.packaging_condition,
            confidence=result.confidence,
            timestamp=result.timestamp
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")


@router.post("/generate-followup")
async def generate_followup(request: FollowUpRequest):
    """
    Generate intelligent follow-up question
    
    **Use Case**: When case has missing critical information
    
    **Example Request:**
    ```json
    {
        "medicine": "Paracetamol",
        "symptoms": "Severe rash",
        "risk_level": 4,
        "missing_fields": ["batch_number", "dosage"]
    }
    ```
    
    **Returns**: Natural language question to ask patient
    """
    if not ai_engine:
        raise HTTPException(
            status_code=503,
            detail="AI Engine not available. Set GEMINI_API_KEY environment variable."
        )
    
    try:
        case_data = {
            "medicine": request.medicine,
            "symptoms": request.symptoms,
            "risk_level": request.risk_level
        }
        
        question = ai_engine.generate_follow_up_question(
            case_data=case_data,
            missing_fields=request.missing_fields
        )
        
        return {"question": question}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Follow-up generation failed: {str(e)}")


@router.get("/health")
async def health_check():
    """Check if AI engine is initialized and ready"""
    if ai_engine:
        return {
            "status": "healthy",
            "engine": "Gemini 1.5 Flash",
            "capabilities": ["risk_triage", "vision_analysis", "follow_up_generation"]
        }
    else:
        return {
            "status": "unavailable",
            "error": "GEMINI_API_KEY not set"
        }
