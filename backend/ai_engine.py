"""
Medicova AI Engine - Production Implementation
Uses Google Gemini 1.5 Flash for real-time risk assessment and vision analysis
Author: Medicova AI Team
"""

import os
import json
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class RiskAssessment:
    """Structured risk assessment result"""
    risk_level: int  # 1-5
    reasoning: str
    entities: List[str]
    missing_batch_id: bool
    confidence: float
    timestamp: str


@dataclass
class VisionAnalysis:
    """Structured vision analysis result"""
    medicine_name: Optional[str]
    batch_no: Optional[str]
    expiry_date: Optional[str]
    packaging_condition: str
    confidence: float
    timestamp: str


class MedicovaAIEngine:
    """
    Production AI Engine for Medicova Platform
    
    Why Gemini 1.5 Flash?
    - Fast inference (< 2 seconds)
    - Multimodal (text + vision)
    - Free tier: 15 requests/minute
    - No GPU infrastructure needed
    - Better than BioMistral for production
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize AI Engine
        
        Args:
            api_key: Gemini API key (defaults to GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "Gemini API key required. Set GEMINI_API_KEY environment variable "
                "or pass api_key parameter. Get free key at: https://aistudio.google.com"
            )
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("✅ Medicova AI Engine initialized with Gemini 1.5 Flash")
    
    def analyze_risk_triage(
        self, 
        patient_text: str, 
        patient_age: int,
        patient_gender: str = "Unknown",
        medical_history: Optional[List[str]] = None
    ) -> RiskAssessment:
        """
        Analyze patient report and assign risk level
        
        Args:
            patient_text: Patient's symptom description
            patient_age: Patient age
            patient_gender: Patient gender
            medical_history: List of existing conditions
            
        Returns:
            RiskAssessment object with risk level, entities, and reasoning
        """
        logger.info(f"🧠 Analyzing risk for: '{patient_text[:50]}...'")
        
        history_str = ", ".join(medical_history) if medical_history else "None reported"
        
        prompt = f"""
You are a Pharmacovigilance Expert System for Medicova, an AI-powered adverse drug reaction monitoring platform.

**Patient Profile:**
- Age: {patient_age}
- Gender: {patient_gender}
- Medical History: {history_str}

**Patient Report:**
"{patient_text}"

**Task:**
Analyze this adverse drug reaction report and provide a structured assessment.

**Risk Level Classification:**
1. **Level 1 (Inquiry)**: General questions, no adverse effects
2. **Level 2 (Mild)**: Minor side effects (headache, nausea), no intervention needed
3. **Level 3 (Moderate)**: Significant discomfort, may need doctor consultation
4. **Level 4 (Severe)**: Serious reactions (rash, vomiting, chest pain), immediate doctor review
5. **Level 5 (Critical/Emergency)**: Life-threatening (breathing difficulty, anaphylaxis, seizures), call 102

**Output Format (JSON only, no markdown):**
{{
    "risk_level": <1-5>,
    "reasoning": "<brief clinical justification>",
    "entities": ["<medicine1>", "<symptom1>", "<symptom2>"],
    "missing_batch_id": <true if batch/lot number not mentioned>,
    "confidence": <0.0-1.0>
}}

**Critical Rules:**
- If "breathing", "anaphylaxis", "seizure", "unconscious" → Level 5
- If "chest pain", "severe rash", "bleeding" → Level 4
- Extract ALL medicines and symptoms mentioned
- Set missing_batch_id=true if no batch/lot number found
"""
        
        try:
            response = self.model.generate_content(prompt)
            cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned_text)
            
            return RiskAssessment(
                risk_level=result.get("risk_level", 5),  # Default to high risk on error
                reasoning=result.get("reasoning", ""),
                entities=result.get("entities", []),
                missing_batch_id=result.get("missing_batch_id", True),
                confidence=result.get("confidence", 0.0),
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"❌ AI Triage Error: {e}")
            # Fail-safe: Default to high risk
            return RiskAssessment(
                risk_level=5,
                reasoning=f"AI analysis failed, defaulting to high risk. Error: {str(e)}",
                entities=[],
                missing_batch_id=True,
                confidence=0.0,
                timestamp=datetime.now().isoformat()
            )
    
    def analyze_vision_evidence(self, image_path: str) -> VisionAnalysis:
        """
        Analyze medicine packaging image to extract batch info
        
        Args:
            image_path: Path to medicine strip/box image
            
        Returns:
            VisionAnalysis object with extracted data
        """
        logger.info(f"👁️ Analyzing image: {image_path}")
        
        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            return VisionAnalysis(
                medicine_name=None,
                batch_no=None,
                expiry_date=None,
                packaging_condition="Error: Image not found",
                confidence=0.0,
                timestamp=datetime.now().isoformat()
            )
        
        try:
            # Upload image to Gemini
            sample_file = genai.upload_file(path=image_path, display_name="Medicine Evidence")
            logger.info(f"   ✓ Image uploaded: {sample_file.uri}")
            
            prompt = """
You are analyzing a medicine packaging image for pharmacovigilance purposes.

**Extract the following information:**
1. **Medicine Name**: Brand name printed on the strip/box
2. **Batch Number**: Look for "B.No", "Batch", "Lot", "Lot No"
3. **Expiry Date**: Look for "Exp", "Expiry", "Use Before"
4. **Packaging Condition**: Assess if "Intact", "Damaged", "Tampered", or "Unclear"

**Output Format (JSON only):**
{{
    "medicine_name": "<name or null>",
    "batch_no": "<batch number or null>",
    "expiry_date": "<MM/YYYY or null>",
    "packaging_condition": "<Intact|Damaged|Tampered|Unclear>",
    "confidence": <0.0-1.0>
}}

**Rules:**
- If text is unreadable, return null for that field
- Batch numbers are usually alphanumeric (e.g., "B7892X", "LOT12345")
- Expiry dates are usually MM/YYYY format
- Be conservative with confidence scores
"""
            
            response = self.model.generate_content([sample_file, prompt])
            cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
            result = json.loads(cleaned_text)
            
            return VisionAnalysis(
                medicine_name=result.get("medicine_name"),
                batch_no=result.get("batch_no"),
                expiry_date=result.get("expiry_date"),
                packaging_condition=result.get("packaging_condition", "Unclear"),
                confidence=result.get("confidence", 0.0),
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"❌ Vision Analysis Error: {e}")
            return VisionAnalysis(
                medicine_name=None,
                batch_no=None,
                expiry_date=None,
                packaging_condition=f"Error: {str(e)}",
                confidence=0.0,
                timestamp=datetime.now().isoformat()
            )
    
    def generate_follow_up_question(
        self, 
        case_data: Dict,
        missing_fields: List[str]
    ) -> str:
        """
        Generate intelligent follow-up question based on missing data
        
        Args:
            case_data: Current case information
            missing_fields: List of missing required fields
            
        Returns:
            Natural language follow-up question
        """
        prompt = f"""
You are a compassionate medical assistant for Medicova.

**Case Summary:**
- Medicine: {case_data.get('medicine', 'Unknown')}
- Symptoms: {case_data.get('symptoms', 'Not specified')}
- Risk Level: {case_data.get('risk_level', 'Unknown')}

**Missing Information:**
{', '.join(missing_fields)}

**Task:**
Generate a single, empathetic follow-up question to collect the most critical missing information.

**Guidelines:**
- Be warm and reassuring
- Prioritize batch number if risk is high
- Use simple language
- One question at a time
- Return ONLY the question text, no JSON
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"❌ Follow-up generation error: {e}")
            return "Could you please provide any additional details about the medicine packaging?"


# ==========================================
# STANDALONE TEST (for development)
# ==========================================
if __name__ == "__main__":
    print("=" * 60)
    print("MEDICOVA AI ENGINE - STANDALONE TEST")
    print("=" * 60)
    
    # Initialize engine
    try:
        engine = MedicovaAIEngine()
    except ValueError as e:
        print(f"\n❌ {e}")
        print("\n💡 Quick Setup:")
        print("1. Visit: https://aistudio.google.com")
        print("2. Get your free API key")
        print("3. Set environment variable:")
        print("   export GEMINI_API_KEY='your-key-here'")
        exit(1)
    
    # Test 1: Risk Triage
    print("\n" + "=" * 60)
    print("TEST 1: RISK TRIAGE ANALYSIS")
    print("=" * 60)
    
    test_cases = [
        ("I have a mild headache after taking Paracetamol", 30, "Female"),
        ("Severe rash and itching after Amoxicillin", 45, "Male"),
        ("My father can't breathe after taking Aspirin, lips turning blue", 65, "Male")
    ]
    
    for text, age, gender in test_cases:
        print(f"\n📝 Input: '{text}'")
        result = engine.analyze_risk_triage(text, age, gender)
        print(f"   Risk Level: {result.risk_level}/5")
        print(f"   Reasoning: {result.reasoning}")
        print(f"   Entities: {result.entities}")
        print(f"   Missing Batch: {result.missing_batch_id}")
    
    # Test 2: Follow-up Question
    print("\n" + "=" * 60)
    print("TEST 2: INTELLIGENT FOLLOW-UP")
    print("=" * 60)
    
    case_data = {
        "medicine": "Dolo-650",
        "symptoms": "Severe rash",
        "risk_level": 4
    }
    question = engine.generate_follow_up_question(case_data, ["batch_number", "dosage"])
    print(f"\n🤖 AI Follow-up: {question}")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS COMPLETED")
    print("=" * 60)
