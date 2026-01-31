# 🚀 WhatsApp Bot Deployment Guide - Step by Step

## 📋 Overview

This guide will walk you through deploying the Medicova WhatsApp bot from local testing to production on AWS EC2. The bot allows patients to report adverse drug reactions via WhatsApp conversations.

---

## 🎯 Deployment Phases

1. **Local Setup & Testing** (30 minutes)
2. **Twilio Account Setup** (15 minutes)
3. **Database Setup** (10 minutes)
4. **Local Testing with ngrok** (20 minutes)
5. **AWS EC2 Deployment** (60 minutes)
6. **Production Configuration** (30 minutes)

---

## 📦 Phase 1: Local Setup & Testing

### Step 1.1: Verify Files

Check that you have these files in `ai-side/`:
```bash
cd ai-side
ls
```

**Required files:**
- ✅ `Whatsapp_Model.ipynb` - Original notebook
- ✅ `whatsapp_model_deployed.py` - Production FastAPI code (if deleted, we'll recreate it)

### Step 1.2: Install Dependencies

```bash
cd backend
pip install twilio python-dotenv psycopg2-binary
```

**What you need:**
- Python 3.11+
- pip package manager

---

## 🔑 Phase 2: Twilio Account Setup

### Step 2.1: Create Twilio Account

1. **Go to:** https://www.twilio.com/try-twilio
2. **Sign up** with your email
3. **Verify** your phone number
4. **Get $15 free credit** (no credit card required for trial)

### Step 2.2: Get WhatsApp Sandbox Access

1. **Navigate to:** Console → Messaging → Try it out → Send a WhatsApp message
2. **Scan QR code** or send message to join sandbox:
   - Send `join <your-sandbox-code>` to `+1 415 523 8886`
   - Example: `join happy-tiger-123`

### Step 2.3: Collect Twilio Credentials

**From Twilio Console (https://console.twilio.com):**

| Credential | Where to Find | Example Format |
|:-----------|:--------------|:---------------|
| **Account SID** | Console Dashboard | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| **Auth Token** | Console Dashboard (click "Show") | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| **WhatsApp Number** | Messaging → Try WhatsApp | `whatsapp:+14155238886` |

**Save these - you'll need them in Step 3!**

---

## 💾 Phase 3: Database Setup

### Step 3.1: Create Bot Session Table

Your Neon DB already has the main tables. Now add the bot session table:

**Option A: Using Neon DB Console**
1. Go to https://console.neon.tech
2. Select your project
3. Go to SQL Editor
4. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS bot_session (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    current_phase VARCHAR(50),
    temp_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_session_phone ON bot_session(phone_number);
```

**Option B: Using Python Script**
```bash
cd backend
python -c "
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('''
        CREATE TABLE IF NOT EXISTS bot_session (
            id SERIAL PRIMARY KEY,
            phone_number VARCHAR(50) UNIQUE NOT NULL,
            current_phase VARCHAR(50),
            temp_data JSONB,
            created_at TIMESTAMP DEFAULT NOW(),
            last_updated TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_bot_session_phone ON bot_session(phone_number);
    '''))
    conn.commit()
print('✅ Bot session table created!')
"
```

### Step 3.2: Update .env File

Add Twilio credentials to `backend/.env`:

```bash
# Existing credentials
DATABASE_URL=your_existing_neon_db_url
GEMINI_API_KEY=your_existing_gemini_key
SECRET_KEY=your_existing_secret

# NEW: Twilio WhatsApp Bot Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

---

## 🧪 Phase 4: Local Testing with ngrok

### Step 4.1: Install ngrok

**Windows:**
```bash
# Download from https://ngrok.com/download
# Or use chocolatey:
choco install ngrok
```

**Mac/Linux:**
```bash
brew install ngrok
# Or download from https://ngrok.com/download
```

### Step 4.2: Get ngrok Auth Token

1. **Sign up:** https://dashboard.ngrok.com/signup
2. **Get token:** https://dashboard.ngrok.com/get-started/your-authtoken
3. **Configure:**
```bash
ngrok config add-authtoken YOUR_NGROK_TOKEN
```

### Step 4.3: Recreate WhatsApp Bot File

Since the file was deleted, let's recreate it:

```bash
# I'll create this file for you in the next step
```

### Step 4.4: Start Local Server

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - ngrok:**
```bash
ngrok http 8000
```

**You'll see output like:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8000
```

**Copy the `https://abc123.ngrok.io` URL!**

### Step 4.5: Configure Twilio Webhook

1. **Go to:** Twilio Console → Messaging → Settings → WhatsApp Sandbox Settings
2. **When a message comes in:**
   ```
   https://abc123.ngrok.io/whatsapp/webhook
   ```
3. **Method:** POST
4. **Save**

### Step 4.6: Test the Bot

1. **Send a WhatsApp message** to your Twilio sandbox number
2. **Expected flow:**
   ```
   You: Hi
   Bot: Welcome to Medicova! 🏥 I'm here to help you report...
   ```

---

## ☁️ Phase 5: AWS EC2 Deployment

### Step 5.1: Create AWS Account

1. **Sign up:** https://aws.amazon.com/free
2. **Choose:** Free tier (12 months free)
3. **Verify:** Credit card required (won't be charged for free tier)

### Step 5.2: Launch EC2 Instance

**AWS Console → EC2 → Launch Instance:**

| Setting | Value | Why |
|:--------|:------|:----|
| **Name** | medicova-whatsapp-bot | Easy identification |
| **OS** | Ubuntu 22.04 LTS | Stable, well-supported |
| **Instance Type** | t2.micro | Free tier eligible |
| **Key Pair** | Create new: `medicova-key.pem` | SSH access |
| **Storage** | 20GB gp3 | Sufficient for app |

**Security Group Settings:**
- ✅ SSH (Port 22) - Your IP only
- ✅ HTTP (Port 80) - 0.0.0.0/0
- ✅ HTTPS (Port 443) - 0.0.0.0/0
- ✅ Custom TCP (Port 8000) - 0.0.0.0/0

**Click "Launch Instance"**

### Step 5.3: Connect to EC2

**Download your key file** (`medicova-key.pem`)

**Windows (PowerShell):**
```powershell
# Set permissions
icacls medicova-key.pem /inheritance:r
icacls medicova-key.pem /grant:r "$($env:USERNAME):R"

# Connect
ssh -i medicova-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

**Mac/Linux:**
```bash
chmod 400 medicova-key.pem
ssh -i medicova-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 5.4: Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install Git
sudo apt install git -y

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install Supervisor (process manager)
sudo apt install supervisor -y
```

### Step 5.5: Clone Your Repository

```bash
cd /home/ubuntu
git clone https://github.com/TishyaJ/Medicova_AI_Pharmacovigilance_Platform.git
cd Medicova_AI_Pharmacovigilance_Platform/medicircle-connect
```

### Step 5.6: Setup Python Environment

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
pip install twilio psycopg2-binary
```

### Step 5.7: Configure Environment Variables

```bash
# Create production .env file
nano /home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/backend/.env
```

**Add:**
```bash
DATABASE_URL=your_neon_db_url
GEMINI_API_KEY=your_gemini_key
SECRET_KEY=your_secret_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
ENVIRONMENT=production
```

**Save:** Ctrl+O, Enter, Ctrl+X

### Step 5.8: Setup Supervisor (Auto-restart)

```bash
sudo nano /etc/supervisor/conf.d/medicova.conf
```

**Add:**
```ini
[program:medicova-backend]
command=/home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
directory=/home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/backend
user=ubuntu
autostart=true
autorestart=true
stderr_logfile=/var/log/medicova/backend.err.log
stdout_logfile=/var/log/medicova/backend.out.log
environment=PATH="/home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/venv/bin"
```

**Create log directory:**
```bash
sudo mkdir -p /var/log/medicova
sudo chown ubuntu:ubuntu /var/log/medicova
```

**Start the service:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start medicova-backend
sudo supervisorctl status medicova-backend
```

### Step 5.9: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/medicova
```

**Add:**
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # Replace with your IP or domain

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/medicova /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 Phase 6: Production Configuration

### Step 6.1: Update Twilio Webhook

1. **Go to:** Twilio Console → WhatsApp Sandbox Settings
2. **Update webhook URL:**
   ```
   http://YOUR_EC2_PUBLIC_IP/whatsapp/webhook
   ```
   Or if you have a domain:
   ```
   https://yourdomain.com/whatsapp/webhook
   ```

### Step 6.2: Test Production Bot

Send a WhatsApp message to your Twilio number. You should get a response!

### Step 6.3: Monitor Logs

```bash
# View real-time logs
sudo tail -f /var/log/medicova/backend.out.log

# View errors
sudo tail -f /var/log/medicova/backend.err.log
```

---

## 📊 Summary of Accounts & Keys Needed

| Service | What You Need | Cost | Sign Up URL |
|:--------|:--------------|:-----|:------------|
| **Twilio** | Account SID, Auth Token, WhatsApp Number | $15 free credit | https://www.twilio.com/try-twilio |
| **ngrok** | Auth token | Free tier | https://ngrok.com/signup |
| **AWS** | Account, EC2 instance | Free tier (12 months) | https://aws.amazon.com/free |
| **Neon DB** | Already have ✅ | Free tier | - |
| **Gemini API** | Already have ✅ | Free tier | - |

---

## 🎯 Quick Start Checklist

- [ ] Create Twilio account & get credentials
- [ ] Join WhatsApp sandbox
- [ ] Create `bot_session` table in database
- [ ] Add Twilio credentials to `.env`
- [ ] Install ngrok & get auth token
- [ ] Test locally with ngrok
- [ ] Create AWS account
- [ ] Launch EC2 instance
- [ ] Install dependencies on EC2
- [ ] Deploy code to EC2
- [ ] Configure Supervisor & Nginx
- [ ] Update Twilio webhook to EC2 URL
- [ ] Test production bot

---

## 🆘 Troubleshooting

### Bot doesn't respond
- Check Twilio webhook URL is correct
- Verify EC2 security group allows port 8000
- Check logs: `sudo tail -f /var/log/medicova/backend.out.log`

### Database errors
- Verify `bot_session` table exists
- Check DATABASE_URL in `.env`
- Test connection: `psql $DATABASE_URL`

### EC2 connection issues
- Verify security group allows SSH from your IP
- Check key file permissions: `chmod 400 medicova-key.pem`

---

**Need help at any step? Let me know which phase you're on!** 🚀
