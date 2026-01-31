# 🤖 WhatsApp Bot Deployment Guide
## Complete Setup: Local Testing → EC2 Production

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Setup & Testing](#local-setup--testing)
3. [Twilio Configuration](#twilio-configuration)
4. [EC2 Deployment](#ec2-deployment)
5. [Production Checklist](#production-checklist)

---

## 🔧 Prerequisites

### Required Accounts
- ✅ **Twilio Account** (Free trial: $15 credit)
  - Sign up: https://www.twilio.com/try-twilio
  - Verify your phone number
  
- ✅ **AWS Account** (Free tier eligible)
  - Sign up: https://aws.amazon.com/free
  
- ✅ **Neon DB** (Already have this)
  - Your existing database will work

### Required Software
```bash
# Local machine
- Python 3.11+
- ngrok (for local testing)

# EC2 instance (we'll install later)
- Ubuntu 22.04 LTS
- Python 3.11
- Nginx
- Supervisor
```

---

## 🏠 Phase 1: Local Setup & Testing

### Step 1.1: Install ngrok

**Windows:**
```powershell
# Download from https://ngrok.com/download
# Or use Chocolatey
choco install ngrok

# Authenticate (get auth token from ngrok.com)
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

### Step 1.2: Create Database Table

```bash
# Connect to your Neon DB and run:
cd backend
python
```

```python
from database import engine
from sqlmodel import text

# Create bot_session table
with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS bot_session (
            id SERIAL PRIMARY KEY,
            phone_number VARCHAR(50) UNIQUE NOT NULL,
            current_phase VARCHAR(50),
            temp_data JSONB,
            created_at TIMESTAMP DEFAULT NOW(),
            last_updated TIMESTAMP DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_bot_session_phone 
        ON bot_session(phone_number);
    """))
    conn.commit()
    print("✅ bot_session table created!")
```

### Step 1.3: Update Environment Variables

Add to `backend/.env`:
```bash
# Existing variables
DATABASE_URL=your_neon_db_url
GEMINI_API_KEY=your_gemini_key

# Add Twilio credentials (get from Twilio Console)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

### Step 1.4: Integrate WhatsApp Router

**File: `backend/main.py`**

Add this import:
```python
# Add to imports
import sys
sys.path.append('../ai-side')
from whatsapp_model_deployed import router as whatsapp_router
```

Add this router:
```python
# Add after other routers
app.include_router(whatsapp_router)
```

### Step 1.5: Start Local Server

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - ngrok:**
```bash
ngrok http 8000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

---

## 📱 Phase 2: Twilio Configuration

### Step 2.1: Get Twilio Sandbox

1. Go to Twilio Console: https://console.twilio.com
2. Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. You'll see a sandbox number like: `+1 415 523 8886`
4. Send the join code from your phone (e.g., "join abc-xyz")

### Step 2.2: Configure Webhook

1. In Twilio Console → **Messaging** → **Settings** → **WhatsApp Sandbox**
2. Set **"When a message comes in"** to:
   ```
   https://abc123.ngrok-free.app/whatsapp/webhook
   ```
   (Replace with your ngrok URL)
3. Method: **POST**
4. Click **Save**

### Step 2.3: Test the Bot

Send a WhatsApp message to the Twilio sandbox number:

```
You: Hi
Bot: 🏥 Welcome to Medicova - AI-Powered Pharmacovigilance...
     Do you consent to share your health information? (Yes/No)

You: Yes
Bot: ✅ Thank you! Let's set up your profile...
     What is your age?

You: 35
Bot: What is your gender? (Male/Female/Other)

You: Male
...
```

### Step 2.4: Verify Database

```python
# Check if sessions are being saved
from database import engine
from sqlmodel import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM bot_session"))
    for row in result:
        print(row)
```

---

## ☁️ Phase 3: EC2 Deployment

### Step 3.1: Launch EC2 Instance

**AWS Console → EC2 → Launch Instance**

```yaml
Name: medicova-backend
AMI: Ubuntu Server 22.04 LTS
Instance Type: t3.medium (2 vCPU, 4GB RAM)
Key Pair: Create new → medicova-prod.pem (download it!)
Security Group:
  - SSH (22): Your IP only
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
Storage: 30GB gp3
```

Click **Launch Instance**

### Step 3.2: Connect to EC2

**Windows (PowerShell):**
```powershell
# Set permissions on .pem file
icacls medicova-prod.pem /inheritance:r
icacls medicova-prod.pem /grant:r "%username%:R"

# Connect
ssh -i medicova-prod.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3.3: Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install Nginx
sudo apt install nginx -y

# Install Supervisor (process manager)
sudo apt install supervisor -y

# Install Git
sudo apt install git -y
```

### Step 3.4: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/TishyaJ/Medicova_AI_Pharmacovigilance_Platform.git
cd Medicova_AI_Pharmacovigilance_Platform/medicircle-connect
```

### Step 3.5: Setup Python Environment

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
pip install psycopg2-binary twilio python-dotenv
```

### Step 3.6: Create Production .env

```bash
cat > /home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/backend/.env << EOF
DATABASE_URL=postgresql://neondb_owner:npg_T1B5gmEGbSWq@ep-polished-resonance-ah0msyvm-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=AIzaSyC0NIyCVMGJQbOdYuBjor3yg3BjRWWh664
TWILIO_ACCOUNT_SID=YOUR_TWILIO_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_TOKEN
ENVIRONMENT=production
LOG_LEVEL=INFO
EOF

chmod 600 .env
```

### Step 3.7: Configure Supervisor (24/7 Uptime)

```bash
sudo nano /etc/supervisor/conf.d/medicova.conf
```

Paste this:
```ini
[program:medicova-backend]
command=/home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
directory=/home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/backend
user=ubuntu
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/medicova/backend.err.log
stdout_logfile=/var/log/medicova/backend.out.log
environment=PATH="/home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/venv/bin"
```

Create log directory:
```bash
sudo mkdir -p /var/log/medicova
sudo chown ubuntu:ubuntu /var/log/medicova
```

Start the service:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start medicova-backend
sudo supervisorctl status medicova-backend
```

### Step 3.8: Configure Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/medicova
```

Paste this:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # Or your domain

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        access_log off;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/medicova /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 3.9: Update Twilio Webhook

1. Go to Twilio Console
2. Update webhook URL to:
   ```
   http://YOUR_EC2_PUBLIC_IP/whatsapp/webhook
   ```
3. Save

### Step 3.10: Test Production Bot

Send a WhatsApp message to your Twilio number. It should now work from the EC2 server!

---

## 🔒 Phase 4: SSL Certificate (Optional but Recommended)

### Step 4.1: Get a Domain Name

- Use **Route 53** (AWS) or **Namecheap**
- Point A record to your EC2 public IP

### Step 4.2: Install SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot --nginx -d api.medicova.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

### Step 4.3: Update Twilio Webhook

Change to HTTPS:
```
https://api.medicova.com/whatsapp/webhook
```

---

## ✅ Production Checklist

### Before Going Live

- [ ] ✅ Database `bot_session` table created
- [ ] ✅ Environment variables set in EC2
- [ ] ✅ Supervisor running (check: `sudo supervisorctl status`)
- [ ] ✅ Nginx configured and running
- [ ] ✅ Twilio webhook points to EC2 URL
- [ ] ✅ Test WhatsApp conversation end-to-end
- [ ] ✅ Check logs: `tail -f /var/log/medicova/backend.out.log`
- [ ] ✅ SSL certificate installed (if using domain)

### Monitoring

**Check backend status:**
```bash
sudo supervisorctl status medicova-backend
```

**View logs:**
```bash
# Real-time logs
tail -f /var/log/medicova/backend.out.log

# Error logs
tail -f /var/log/medicova/backend.err.log
```

**Restart backend:**
```bash
sudo supervisorctl restart medicova-backend
```

---

## 🐛 Troubleshooting

### Issue: Bot not responding

**Check 1: Backend running?**
```bash
sudo supervisorctl status medicova-backend
curl http://localhost:8000/health
```

**Check 2: Twilio webhook correct?**
- Verify URL in Twilio Console
- Should be: `http://YOUR_IP/whatsapp/webhook`

**Check 3: Database connection?**
```bash
# Test from EC2
python3
>>> from database import engine
>>> engine.connect()
```

### Issue: 500 Internal Server Error

**Check logs:**
```bash
tail -50 /var/log/medicova/backend.err.log
```

Common causes:
- Missing environment variables
- Database connection failed
- Import errors

### Issue: Nginx 502 Bad Gateway

**Check if backend is running:**
```bash
sudo supervisorctl status medicova-backend
netstat -tuln | grep 8000
```

---

## 📊 Cost Estimate

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| EC2 (t3.medium) | 24/7 uptime | $30 |
| Neon DB | Pro plan | $19 |
| Twilio | WhatsApp messages | ~$5 (pay-as-you-go) |
| **Total** | | **~$54/month** |

**Free Tier:**
- Twilio: $15 credit
- AWS: 750 hours/month free (t2.micro for 12 months)
- Neon DB: Free tier available

---

## 🚀 Next Steps After Deployment

1. **Monitor Usage**: Set up CloudWatch alerts
2. **Auto-Scaling**: Configure ASG for high traffic
3. **Backup**: Daily database backups
4. **Analytics**: Track conversation completion rates
5. **Multi-language**: Add Hindi/Tamil support

---

## 📞 Quick Reference

**Start Backend:**
```bash
sudo supervisorctl start medicova-backend
```

**Stop Backend:**
```bash
sudo supervisorctl stop medicova-backend
```

**Restart Backend:**
```bash
sudo supervisorctl restart medicova-backend
```

**View Logs:**
```bash
tail -f /var/log/medicova/backend.out.log
```

**Update Code:**
```bash
cd /home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect
git pull
sudo supervisorctl restart medicova-backend
```

---

**Last Updated:** 2026-02-01  
**Status:** Production Ready ✅
