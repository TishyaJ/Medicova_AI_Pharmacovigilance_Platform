import os
import json
from datetime import datetime
from typing import Dict, Optional, Tuple
from fastapi import FastAPI, APIRouter, Request, HTTPException, Form
from fastapi.responses import Response
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv

# 1. LOAD CONFIGURATION
load_dotenv() # This looks for your .env file
DB_URL = os.getenv("DATABASE_URL")

# 2. INITIALIZE ROUTER
# We define this first so it can be used in the functions below
router = APIRouter(prefix="/whatsapp", tags=["WhatsApp Bot"])

# ==========================================
# SESSION MANAGEMENT (State Machine)
# ==========================================

def get_session(phone: str) -> Tuple[Optional[str], Dict]:
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
        return None, {}
    except Exception as e:
        print(f"❌ DB Read Error: {e}")
        return None, {}

def update_session(phone: str, next_phase: Optional[str], new_data: Optional[Dict] = None):
    try:
        current_phase, existing_data = get_session(phone)
        if new_data:
            existing_data.update(new_data)
        
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM bot_session WHERE phone_number = %s", (phone,))
        exists = cur.fetchone()
        
        json_data = json.dumps(existing_data)
        if exists:
            cur.execute(
                "UPDATE bot_session SET current_phase=%s, temp_data=%s, last_updated=NOW() WHERE phone_number=%s",
                (next_phase, json_data, phone)
            )
        else:
            cur.execute(
                "INSERT INTO bot_session (phone_number, current_phase, temp_data) VALUES (%s, %s, %s)",
                (phone, next_phase, json_data)
            )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"❌ DB Update Error: {e}")

# ==========================================
# CONVERSATION FLOW LOGIC
# ==========================================

def process_message(incoming_msg: str, sender: str) -> str:
    msg_lower = incoming_msg.lower().strip()
    phase, data = get_session(sender)
    
    if msg_lower == "reset":
        update_session(sender, None, {})
        phase = None
    
    if phase is None:
        update_session(sender, "WAIT_CONSENT")
        return "👋 Welcome to Medicova!\n\nDo you agree to continue with a safety report?\n(Reply: Yes or No)"
    
    elif phase == "WAIT_CONSENT":
        if "yes" in msg_lower:
            update_session(sender, "WAIT_AGE", {"consent": True})
            return "✅ Great! Let's start.\n\nQ1: What is your age?\n(Reply: Below 12, 12-18, 19-40, 41-60, Above 60)"
        update_session(sender, None)
        return "Okay. Type 'Reset' anytime to start over."

    elif phase == "WAIT_AGE":
        update_session(sender, "WAIT_GENDER", {"age": incoming_msg})
        return "Q2: Select your gender\n(Reply: Male, Female, Other)"

    elif phase == "WAIT_GENDER":
        update_session(sender, "WAIT_PIN", {"gender": incoming_msg})
        return "Q3: Enter your 6-digit PIN Code."

    elif phase == "WAIT_PIN":
        update_session(sender, "WAIT_MEDICINE", {"pincode": incoming_msg})
        return "✅ Profile Setup Complete.\n\n💊 Which medicine did you take?\n(e.g., Dolo-650, Augmentin)"

    elif phase == "WAIT_MEDICINE":
        update_session(sender, "WAIT_DOSAGE", {"medicine_name": incoming_msg})
        return "🕒 Dosage & Timing: How much did you take and when?"

    elif phase == "WAIT_DOSAGE":
        update_session(sender, "WAIT_OTHER_MEDS", {"dosage": incoming_msg})
        return "💊 Other Medicines: Are you taking any other medicines? (Reply 'No' or list them)"

    elif phase == "WAIT_OTHER_MEDS":
        update_session(sender, "WAIT_ALLERGIES", {"other_medicines": incoming_msg})
        return "🤧 Allergies: Any known allergies to drugs or food?"

    elif phase == "WAIT_ALLERGIES":
        update_session(sender, "WAIT_SIDE_EFFECT", {"allergies": incoming_msg})
        return "⚠️ Side Effect: What side effect are you facing?"

    elif phase == "WAIT_SIDE_EFFECT":
        update_session(sender, "WAIT_STOPPED", {"symptoms": incoming_msg})
        return "🛑 Action Taken: Did you stop taking the medicine? (Yes/No)"

    elif phase == "WAIT_STOPPED":
        data['stopped'] = incoming_msg
        summary = (
            f"📋 Confirm Report\n\n💊 Med: {data.get('medicine_name')}\n"
            f"⚠️ Symptom: {data.get('symptoms')}\n"
            "Reply SUBMIT to finish or RESET to start over."
        )
        update_session(sender, "WAIT_FINAL_SUBMIT", {"stopped": incoming_msg})
        return summary

    elif phase == "WAIT_FINAL_SUBMIT":
        if "submit" in msg_lower:
            try:
                conn = psycopg2.connect(DB_URL)
                cur = conn.cursor()
                cur.execute(
                    "INSERT INTO feedback (user_id, medicine_name, symptoms, dosage, source, status, created_at) "
                    "VALUES (1, %s, %s, %s, 'whatsapp', 'pending', NOW())",
                    (data.get('medicine_name'), data.get('symptoms'), data.get('dosage'))
                )
                conn.commit()
                conn.close()
                update_session(sender, None, {})
                return "✅ Report Submitted Successfully!"
            except Exception as e:
                return f"❌ Error saving report: {str(e)}"
        return "Please reply SUBMIT to finish."

    return "I didn't understand. Type 'Reset' to restart."

# ==========================================
# ENDPOINTS
# ==========================================

@router.post("/webhook")
async def whatsapp_webhook(Body: str = Form(...), From: str = Form(...)):
    if not DB_URL:
        return Response(content='<Response><Message>DB Error</Message></Response>', media_type="application/xml")
    
    response_text = process_message(Body, From)
    twiml = f'<Response><Message>{response_text}</Message></Response>'
    return Response(content=twiml, media_type="application/xml")

@router.get("/health")
async def whatsapp_health():
    return {"status": "healthy", "database": "connected" if DB_URL else "missing"}

# 3. CREATE APP AND INCLUDE ROUTER
# This MUST be at the bottom so 'router' is fully defined before inclusion
app = FastAPI()
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)