"""
Risk Triage Engine - Module 1
Lightweight alternative to BioMistral using BioClinicalBERT + XGBoost

This module analyzes patient text and medical history to predict risk levels (1-5).
Uses a hybrid approach: BERT embeddings for text + XGBoost for tabular data.
"""

import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel, pipeline
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class RiskTriageEngine:
    """
    Analyzes adverse event reports to predict risk level and extract medical entities.
    
    Architecture:
    - Text Analysis: BioClinicalBERT for medical text understanding
    - NER: Biomedical NER for entity extraction
    - Classification: Zero-shot classification for risk assessment
    - Fallback: Rule-based scoring if models fail
    """
    
    def __init__(self, use_gpu: bool = False):
        """
        Initialize the risk triage engine.
        
        Args:
            use_gpu: Whether to use GPU acceleration (default: False for CPU)
        """
        self.device = "cuda" if use_gpu and torch.cuda.is_available() else "cpu"
        logger.info(f"Initializing RiskTriageEngine on {self.device}")
        
        try:
            # Load lightweight models for production
            self.tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
            self.bert_model = AutoModel.from_pretrained("emilyalsentzer/Bio_ClinicalBERT").to(self.device)
            
            # Zero-shot classifier for risk assessment
            self.risk_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=0 if self.device == "cuda" else -1
            )
            
            # NER for medical entity extraction
            self.ner_pipeline = pipeline(
                "ner",
                model="d4data/biomedical-ner-all",
                aggregation_strategy="simple",
                device=0 if self.device == "cuda" else -1
            )
            
            # Risk categories for zero-shot classification
            self.risk_labels = [
                "Critical Emergency - Life Threatening",
                "Severe Adverse Reaction",
                "Moderate Side Effect",
                "Mild Discomfort",
                "General Inquiry or Positive Feedback"
            ]
            
            logger.info("✅ RiskTriageEngine initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize RiskTriageEngine: {e}")
            raise
    
    def analyze(self, text: str, patient_data: Optional[Dict] = None) -> Dict:
        """
        Analyze a case report and predict risk level.
        
        Args:
            text: Patient's description of symptoms/side effects
            patient_data: Optional patient metadata (age, medical_conditions, allergies)
        
        Returns:
            Dictionary containing:
                - risk_level: Integer 1-5 (1=safe, 5=critical)
                - confidence: Float 0-1
                - status_message: Human-readable status
                - entities: List of extracted medical entities
                - reasoning: Explanation of risk assessment
        """
        try:
            # 1. Extract medical entities
            entities = self._extract_entities(text)
            
            # 2. Classify risk level using zero-shot
            risk_result = self.risk_classifier(text, self.risk_labels)
            top_label = risk_result['labels'][0]
            confidence = risk_result['scores'][0]
            
            # 3. Map label to risk level
            risk_level, status_message = self._map_risk_level(top_label)
            
            # 4. Apply patient-specific adjustments
            if patient_data:
                risk_level, reasoning = self._adjust_for_patient_history(
                    risk_level, entities, patient_data
                )
            else:
                reasoning = f"Based on symptom analysis: {top_label}"
            
            # 5. Rule-based overrides for critical keywords
            risk_level = self._apply_critical_overrides(text, risk_level)
            
            return {
                "risk_level": risk_level,
                "confidence": float(confidence),
                "status_message": status_message,
                "entities": entities,
                "reasoning": reasoning,
                "detected_keywords": self._extract_critical_keywords(text)
            }
            
        except Exception as e:
            logger.error(f"Error in risk analysis: {e}")
            # Fallback to rule-based scoring
            return self._fallback_analysis(text)
    
    def _extract_entities(self, text: str) -> List[Dict]:
        """Extract medical entities (symptoms, medicines, conditions) from text."""
        try:
            raw_entities = self.ner_pipeline(text)
            
            # Filter by confidence and clean up
            entities = []
            for ent in raw_entities:
                if ent['score'] > 0.75:  # High confidence threshold
                    entities.append({
                        "text": ent['word'],
                        "type": ent['entity_group'],
                        "confidence": float(ent['score'])
                    })
            
            return entities
            
        except Exception as e:
            logger.warning(f"NER extraction failed: {e}")
            return []
    
    def _map_risk_level(self, label: str) -> tuple:
        """Map zero-shot label to numeric risk level and status message."""
        mapping = {
            "Critical Emergency - Life Threatening": (5, "🚨 URGENT: Emergency Protocol Initiated"),
            "Severe Adverse Reaction": (4, "⚠️ High Risk: Doctor Review Required"),
            "Moderate Side Effect": (3, "⚡ Moderate: Queued for Review"),
            "Mild Discomfort": (2, "📋 Low Risk: Automated Guidance"),
            "General Inquiry or Positive Feedback": (1, "✅ Safe: Feedback Recorded")
        }
        return mapping.get(label, (3, "⚡ Moderate: Queued for Review"))
    
    def _adjust_for_patient_history(self, base_risk: int, entities: List[Dict], 
                                    patient_data: Dict) -> tuple:
        """Adjust risk level based on patient's medical history."""
        adjustments = []
        
        # Check for allergy interactions
        if patient_data.get('allergies'):
            for entity in entities:
                if entity['type'] in ['CHEMICAL', 'MEDICINE']:
                    for allergy in patient_data['allergies']:
                        if allergy.lower() in entity['text'].lower():
                            base_risk = min(5, base_risk + 1)
                            adjustments.append(f"Known allergy to {entity['text']}")
        
        # Age-based risk adjustment
        age = patient_data.get('age', 0)
        if age > 65 or age < 12:
            base_risk = min(5, base_risk + 1)
            adjustments.append("Vulnerable age group")
        
        # Pre-existing conditions
        if patient_data.get('medical_conditions'):
            conditions = patient_data['medical_conditions']
            high_risk_conditions = ['diabetes', 'hypertension', 'heart disease', 'kidney disease']
            if any(cond in conditions.lower() for cond in high_risk_conditions):
                base_risk = min(5, base_risk + 1)
                adjustments.append("Pre-existing high-risk condition")
        
        reasoning = "Risk adjusted for: " + ", ".join(adjustments) if adjustments else "No patient-specific adjustments"
        return base_risk, reasoning
    
    def _apply_critical_overrides(self, text: str, current_risk: int) -> int:
        """Override risk level if critical keywords are detected."""
        critical_keywords = [
            'can\'t breathe', 'difficulty breathing', 'chest pain', 'unconscious',
            'anaphylaxis', 'severe bleeding', 'seizure', 'stroke', 'heart attack',
            'suicide', 'overdose', 'skin peeling', 'stevens johnson'
        ]
        
        text_lower = text.lower()
        for keyword in critical_keywords:
            if keyword in text_lower:
                logger.warning(f"Critical keyword detected: {keyword}")
                return 5  # Force to maximum risk
        
        return current_risk
    
    def _extract_critical_keywords(self, text: str) -> List[str]:
        """Extract any critical keywords found in the text."""
        critical_keywords = [
            'can\'t breathe', 'difficulty breathing', 'chest pain', 'unconscious',
            'anaphylaxis', 'severe bleeding', 'seizure', 'stroke', 'heart attack',
            'suicide', 'overdose', 'skin peeling', 'stevens johnson', 'swelling',
            'rash', 'vomiting', 'diarrhea', 'fever', 'headache'
        ]
        
        text_lower = text.lower()
        found = [kw for kw in critical_keywords if kw in text_lower]
        return found
    
    def _fallback_analysis(self, text: str) -> Dict:
        """Simple rule-based analysis as fallback when models fail."""
        logger.warning("Using fallback rule-based analysis")
        
        text_lower = text.lower()
        risk_level = 3  # Default to moderate
        
        # Critical keywords
        if any(kw in text_lower for kw in ['can\'t breathe', 'chest pain', 'unconscious']):
            risk_level = 5
        # Severe keywords
        elif any(kw in text_lower for kw in ['severe', 'bleeding', 'swelling', 'rash']):
            risk_level = 4
        # Mild keywords
        elif any(kw in text_lower for kw in ['mild', 'slight', 'minor']):
            risk_level = 2
        # Positive feedback
        elif any(kw in text_lower for kw in ['better', 'improved', 'thank']):
            risk_level = 1
        
        return {
            "risk_level": risk_level,
            "confidence": 0.6,  # Lower confidence for rule-based
            "status_message": "Analysis based on keyword matching",
            "entities": [],
            "reasoning": "Fallback rule-based analysis (models unavailable)",
            "detected_keywords": self._extract_critical_keywords(text)
        }


# Singleton instance for reuse across requests
_risk_engine_instance = None

def get_risk_engine(use_gpu: bool = False) -> RiskTriageEngine:
    """Get or create singleton instance of RiskTriageEngine."""
    global _risk_engine_instance
    if _risk_engine_instance is None:
        _risk_engine_instance = RiskTriageEngine(use_gpu=use_gpu)
    return _risk_engine_instance
