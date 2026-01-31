"""
Medicova WhatsApp Bot - FastAPI Deployment
Conversational bot for adverse drug reaction reporting via WhatsApp

Features:
- Multi-step conversation flow with state management
- Database session persistence
- Twilio webhook integration
- Automatic case creation in Medicova database
"""

import os
import json
from datetime import datetime
from typing import Dict, Optional, Tuple
from fastapi import APIRouter, Request, HTTPException, Form
from fastapi.responses import Response
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp Bot"])

# Database configuration
DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    print("⚠️ WARNING: DATABASE_URL not set. WhatsApp bot will not function.")


# ==========================================
# SESSION MANAGEMENT (State Machine)
# ==========================================

def get_session(phone: str) -> Tuple[Optional[str], Dict]:
    """
    Retrieve user's conversation state from database
    
    Args:
        phone: User's phone number (from Twilio)
        
    Returns:
        Tuple of (current_phase, temp_data_dict)
    """
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        cur.execute(
            "SELECT current_phase, temp_data FROM bot_session WHERE phone_number = %s",
            (phone,)
        )
        row = cur.fetchone()
        conn.close()
        
        if row:
            data = row[1] if row[1] else {}
            return row[0], data
        else:
            return None, {}  # New user
            
    except Exception as e:
        print(f"❌ DB Read Error: {e}")
        return None, {}


def update_session(phone: str, next_phase: Optional[str], new_data: Optional[Dict] = None):
    """
    Update user's conversation state
    
    Args:
        phone: User's phone number
        next_phase: Next conversation phase (or None to reset)
        new_data: New data to merge into session
    """
    try:
        # Get existing data to merge
        current_phase, existing_data = get_session(phone)
        
        # Merge new data
        if new_data:
            existing_data.update(new_data)
        
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute("SELECT 1 FROM bot_session WHERE phone_number = %s", (phone,))
        exists = cur.fetchone()
        
        json_data = json.dumps(existing_data)
        
        if exists:
            # UPDATE existing session
            cur.execute(
                """UPDATE bot_session 
                   SET current_phase=%s, temp_data=%s, last_updated=NOW() 
                   WHERE phone_number=%s""",
                (next_phase, json_data, phone)
            )
        else:
            # INSERT new session
            cur.execute(
                """INSERT INTO bot_session (phone_number, current_phase, temp_data) 
                   VALUES (%s, %s, %s)""",
                (phone, next_phase, json_data)
            )
        
        conn.commit()
        conn.close()
        print(f"💾 State Updated: {next_phase} | Data: {existing_data}")
        
    except Exception as e:
        print(f"❌ DB Update Error: {e}")


# ==========================================
# CONVERSATION FLOW LOGIC
# ==========================================

def process_message(incoming_msg: str, sender: str) -> str:
    """
    Main conversation logic - State machine implementation
    
    Args:
        incoming_msg: User's message
        sender: User's phone number
        
    Returns:
        Bot's response text
    """
    msg_lower = incoming_msg.lower().strip()
    phase, data = get_session(sender)
    
    # --- RESET COMMAND ---
    if msg_lower == "reset":
        update_session(sender, None, {})
        phase = None
    
    # --- CONVERSATION FLOW ---
    
    # 0. START (New User)
    if phase is None:
        update_session(sender, "WAIT_CONSENT")
        return (
            "👋 Welcome to Medicova!\n\n"
            "We help you report medicine side effects safely.\n\n"
            "Do you agree to continue with a safety report?\n"
            "(Reply: Yes or No)"
        )
    
    # 1. CONSENT
    elif phase == "WAIT_CONSENT":
        if "yes" in msg_lower:
            update_session(sender, "WAIT_AGE", {"consent": True})
            return (
                "✅ Great! Let's start.\n\n"
                "Q1: What is your age?\n"
                "(Reply: Below 12, 12-18, 19-40, 41-60, Above 60)"
            )
        else:
            update_session(sender, None)
            return "Okay. Type 'Reset' anytime to start over."
    
    # 2. PROFILE SECTION
    elif phase == "WAIT_AGE":
        update_session(sender, "WAIT_GENDER", {"age": incoming_msg})
        return (
            "Q2: Select your gender\n"
            "(Reply: Male, Female, Other)"
        )
    
    elif phase == "WAIT_GENDER":
        update_session(sender, "WAIT_PIN", {"gender": incoming_msg})
        return "Q3: Enter your 6-digit PIN Code."
    
    elif phase == "WAIT_PIN":
        update_session(sender, "WAIT_MEDICINE", {"pincode": incoming_msg})
        return (
            "✅ Profile Setup Complete.\n\n"
            "Let's report the issue.\n\n"
            "💊 **Which medicine did you take?**\n"
            "(Please type the name, e.g., Dolo-650, Augmentin)"
        )
    
    # 3. MEDICINE DETAILS
    elif phase == "WAIT_MEDICINE":
        update_session(sender, "WAIT_DOSAGE", {"medicine_name": incoming_msg})
        return (
            "🕒 **Dosage & Timing:**\n"
            "How much did you take and when?\n"
            "(e.g., 'One tablet in morning', 'Twice a day', '5ml at night')"
        )
    
    elif phase == "WAIT_DOSAGE":
        update_session(sender, "WAIT_OTHER_MEDS", {"dosage": incoming_msg})
        return (
            "💊 **Other Medicines:**\n"
            "Are you taking any *other* medicines right now?\n"
            "(Reply 'No' or list them)"
        )
    
    elif phase == "WAIT_OTHER_MEDS":
        update_session(sender, "WAIT_ALLERGIES", {"other_medicines": incoming_msg})
        return (
            "🤧 **Allergies:**\n"
            "Do you have any known allergy to drugs or food?\n"
            "(Reply 'No' or details)"
        )
    
    elif phase == "WAIT_ALLERGIES":
        update_session(sender, "WAIT_SIDE_EFFECT", {"allergies": incoming_msg})
        return (
            "⚠️ **Side Effect:**\n"
            "What side effect are you facing?\n"
            "(e.g., Skin rash, Nausea, Dizziness, Breathing difficulty)"
        )
    
    elif phase == "WAIT_SIDE_EFFECT":
        update_session(sender, "WAIT_STOPPED", {"symptoms": incoming_msg})
        return (
            "🛑 **Action Taken:**\n"
            "Did you stop taking the medicine?\n"
            "(Reply: Yes, No, or Not yet)"
        )
    
    # 4. CONFIRMATION & SUBMIT
    elif phase == "WAIT_STOPPED":
        data['stopped'] = incoming_msg
        
        # Create summary for confirmation
        summary = (
            f"📋 *Confirm Report*\n\n"
            f"💊 Med: {data.get('medicine_name')}\n"
            f"🕒 Dose: {data.get('dosage')}\n"
            f"⚠️ Symptom: {data.get('symptoms')}\n"
            f"🛑 Stopped: {incoming_msg}\n\n"
            f"Reply *SUBMIT* to finish or *RESET* to start over."
        )
        
        update_session(sender, "WAIT_FINAL_SUBMIT", {"stopped": incoming_msg})
        return summary
    
    elif phase == "WAIT_FINAL_SUBMIT":
        if "submit" in msg_lower:
            # Save to database
            try:
                conn = psycopg2.connect(DB_URL)
                cur = conn.cursor()
                
                # Calculate severity score (simple keyword-based)
                severity_score = 0.5
                severity_label = "unexpected"
                
                symptoms_lower = data.get('symptoms', '').lower()
                if any(word in symptoms_lower for word in ['breathing', 'anaphylaxis', 'unconscious']):
                    severity_score = 1.0
                    severity_label = "strong"
                elif any(word in symptoms_lower for word in ['severe', 'chest pain', 'bleeding']):
                    severity_score = 0.8
                    severity_label = "strong"
                
                # Insert into feedback table
                insert_query = """
                INSERT INTO feedback
                (user_id, medicine_name, symptoms, dosage, other_medicines, 
                 allergies_reported, stopped_medication, source, status, 
                 severity_score, severity_label, created_at)
                VALUES (1, %s, %s, %s, %s, %s, %s, 'whatsapp', 'pending', %s, %s, NOW())
                """
                
                cur.execute(insert_query, (
                    data.get('medicine_name'),
                    data.get('symptoms'),
                    data.get('dosage'),
                    data.get('other_medicines'),
                    data.get('allergies'),
                    data.get('stopped'),
                    severity_score,
                    severity_label
                ))
                
                conn.commit()
                conn.close()
                
                # Reset session
                update_session(sender, None, {})
                
                return (
                    "✅ **Report Submitted Successfully!**\n\n"
                    "Our doctors will review this shortly.\n"
                    "You'll receive updates on this number.\n\n"
                    "Type 'Reset' to submit another report."
                )
                
            except Exception as e:
                print(f"❌ Database Error: {e}")
                return f"❌ Error saving report: {str(e)}\nPlease try again or contact support."
        else:
            return "Please reply *SUBMIT* to finish or *RESET* to start over."
    
    else:
        return "I didn't understand. Type 'Reset' to restart."


# ==========================================
# FASTAPI WEBHOOK ENDPOINT
# ==========================================

@router.post("/webhook")
async def whatsapp_webhook(
    Body: str = Form(...),
    From: str = Form(...)
):
    """
    Twilio WhatsApp webhook endpoint
    
    Receives messages from Twilio and returns TwiML response
    
    Args:
        Body: Message text from user
        From: User's phone number (format: whatsapp:+1234567890)
        
    Returns:
        TwiML XML response
    """
    if not DB_URL:
        return Response(
            content='<?xml version="1.0" encoding="UTF-8"?><Response><Message>Service temporarily unavailable. Please try again later.</Message></Response>',
            media_type="application/xml"
        )
    
    try:
        # Process the message
        response_text = process_message(Body, From)
        
        # Return TwiML response
        twiml = f'''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{response_text}</Message>
</Response>'''
        
        return Response(content=twiml, media_type="application/xml")
        
    except Exception as e:
        print(f"❌ Webhook Error: {e}")
        error_twiml = '''<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Sorry, something went wrong. Please type 'Reset' to try again.</Message>
</Response>'''
        return Response(content=error_twiml, media_type="application/xml")


@router.get("/health")
async def whatsapp_health():
    """Health check endpoint"""
    if DB_URL:
        try:
            conn = psycopg2.connect(DB_URL)
            conn.close()
            return {
                "status": "healthy",
                "database": "connected",
                "service": "whatsapp_bot"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }
    else:
        return {
            "status": "unhealthy",
            "database": "not_configured",
            "error": "DATABASE_URL not set"
        }


# ==========================================
# DATABASE SCHEMA (For Reference)
# ==========================================
"""
Required table: bot_session

CREATE TABLE IF NOT EXISTS bot_session (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    current_phase VARCHAR(50),
    temp_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bot_session_phone ON bot_session(phone_number);
"""
