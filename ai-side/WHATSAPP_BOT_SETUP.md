# WhatsApp Bot Deployment Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Database Setup

The bot requires a `bot_session` table to track conversation state:

```sql
CREATE TABLE IF NOT EXISTS bot_session (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    current_phase VARCHAR(50),
    temp_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bot_session_phone ON bot_session(phone_number);
```

**Run this in your Neon DB console** (already has DATABASE_URL configured).

### Step 2: Integrate with FastAPI Backend

Add the WhatsApp router to `backend/main.py`:

```python
# backend/main.py
import sys
sys.path.append('../ai-side')  # Add ai-side to path

from whatsapp_model_deployed import router as whatsapp_router

# ... existing code ...

app.include_router(whatsapp_router)  # Add this line
```

### Step 3: Configure Twilio

1. **Get Twilio Account**:
   - Visit [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Sign up for free trial
   - Get WhatsApp Sandbox number

2. **Configure Webhook**:
   - Go to Twilio Console → Messaging → Try it Out → Send a WhatsApp message
   - Set webhook URL to: `https://your-domain.com/whatsapp/webhook`
   - For local testing, use ngrok:
     ```bash
     ngrok http 8000
     # Copy the https URL
     # Set webhook to: https://abc123.ngrok.io/whatsapp/webhook
     ```

### Step 4: Test the Bot

1. **Start Backend**:
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

2. **Send Test Message**:
   - Open WhatsApp
   - Send message to Twilio Sandbox number (e.g., +1 415 523 8886)
   - Send: `join <your-sandbox-code>`
   - Bot will respond with welcome message

---

## 📱 Conversation Flow

```
User: (Sends any message)
Bot: 👋 Welcome to Medicova! Do you agree to continue? (Yes/No)

User: Yes
Bot: Q1: What is your age? (Below 12, 12-18, 19-40, 41-60, Above 60)

User: 19-40
Bot: Q2: Select your gender (Male, Female, Other)

User: Male
Bot: Q3: Enter your 6-digit PIN Code

User: 110001
Bot: ✅ Profile Setup Complete. Which medicine did you take?

User: Paracetamol
Bot: 🕒 Dosage & Timing: How much did you take and when?

User: One tablet in morning
Bot: 💊 Other Medicines: Are you taking any other medicines?

User: No
Bot: 🤧 Allergies: Do you have any known allergies?

User: No
Bot: ⚠️ Side Effect: What side effect are you facing?

User: Severe headache and nausea
Bot: 🛑 Action Taken: Did you stop taking the medicine?

User: Yes
Bot: 📋 Confirm Report
     💊 Med: Paracetamol
     🕒 Dose: One tablet in morning
     ⚠️ Symptom: Severe headache and nausea
     🛑 Stopped: Yes
     
     Reply SUBMIT to finish or RESET to start over

User: SUBMIT
Bot: ✅ Report Submitted Successfully! Our doctors will review this shortly.
```

---

## 🔧 Key Differences from Notebook Version

| Feature | Notebook (Flask) | Deployed (FastAPI) |
|---------|-----------------|-------------------|
| **Framework** | Flask | FastAPI |
| **Secrets** | Hardcoded | Environment variables |
| **Error Handling** | Basic | Comprehensive try-catch |
| **Database** | Direct psycopg2 | Same (compatible) |
| **Deployment** | ngrok tunnel | Production-ready |
| **Health Check** | None | `/whatsapp/health` endpoint |
| **Documentation** | None | Auto-generated OpenAPI docs |

---

## 🔒 Security Improvements

1. **No Hardcoded Secrets**:
   ```python
   # ❌ Notebook version:
   DB_URL = "postgresql://neondb_owner:npg_T1B5gmEGbSWq@..."
   NGROK_AUTH_TOKEN = "38w5AbRYF3T9OYapHg2O3TWIbWR_4rt5tbGDoxtgeNvxZYSZT"
   
   # ✅ Deployed version:
   DB_URL = os.getenv("DATABASE_URL")  # Already set in backend/.env
   ```

2. **Error Messages**:
   - Notebook: Exposes full error traces
   - Deployed: User-friendly messages, logs errors server-side

3. **Database Connection**:
   - Notebook: Keeps connections open
   - Deployed: Closes connections properly

---

## 📊 API Endpoints

### POST /whatsapp/webhook
**Purpose**: Receive messages from Twilio

**Request** (Twilio sends this):
```
Body=Hello&From=whatsapp:+919876543210
```

**Response** (TwiML):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>👋 Welcome to Medicova! Do you agree to continue?</Message>
</Response>
```

### GET /whatsapp/health
**Purpose**: Check if bot is running

**Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "whatsapp_bot"
}
```

---

## 🐛 Troubleshooting

### Bot doesn't respond
1. Check backend logs for errors
2. Verify DATABASE_URL is set: `echo $DATABASE_URL`
3. Test health endpoint: `curl http://localhost:8000/whatsapp/health`
4. Check Twilio webhook URL is correct

### Database errors
1. Run the CREATE TABLE script in Neon DB
2. Verify connection: `psql $DATABASE_URL`
3. Check table exists: `\dt bot_session`

### Twilio webhook fails
1. Ensure ngrok is running (for local testing)
2. Webhook URL must be HTTPS
3. Check Twilio debugger: Console → Monitor → Logs → Errors

---

## 🚀 Production Deployment on AWS EC2

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS Cloud Infrastructure                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │ CloudFront   │────────▶│ Application  │                  │
│  │ (Edge CDN)   │         │ Load Balancer│                  │
│  └──────────────┘         └──────┬───────┘                  │
│                                   │                          │
│                    ┌──────────────┼──────────────┐          │
│                    │              │              │          │
│              ┌─────▼─────┐  ┌────▼─────┐  ┌────▼─────┐    │
│              │  EC2 #1   │  │  EC2 #2  │  │  EC2 #3  │    │
│              │ (Primary) │  │ (Backup) │  │ (Backup) │    │
│              └─────┬─────┘  └────┬─────┘  └────┬─────┘    │
│                    │              │              │          │
│                    └──────────────┼──────────────┘          │
│                                   │                          │
│                            ┌──────▼───────┐                 │
│                            │   Neon DB    │                 │
│                            │ (PostgreSQL) │                 │
│                            └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Step-by-Step EC2 Deployment

### Phase 1: EC2 Instance Setup

#### 1.1 Launch EC2 Instance

```bash
# AWS Console → EC2 → Launch Instance

Instance Type: t3.medium (2 vCPU, 4GB RAM)
OS: Ubuntu 22.04 LTS
Storage: 30GB gp3 SSD
Security Group:
  - Port 22 (SSH) - Your IP only
  - Port 80 (HTTP) - 0.0.0.0/0
  - Port 443 (HTTPS) - 0.0.0.0/0
  - Port 8000 (FastAPI) - Load Balancer only

Key Pair: Create new (medicova-prod.pem)
```

#### 1.2 Connect to Instance

```bash
# Download your .pem file
chmod 400 medicova-prod.pem
ssh -i medicova-prod.pem ubuntu@<EC2-PUBLIC-IP>
```

#### 1.3 Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install PostgreSQL client
sudo apt install postgresql-client -y

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install Supervisor (process manager)
sudo apt install supervisor -y

# Install Git
sudo apt install git -y
```

---

### Phase 2: Application Deployment

#### 2.1 Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/TishyaJ/Medicova_AI_Pharmacovigilance_Platform.git
cd Medicova_AI_Pharmacovigilance_Platform/medicircle-connect
```

#### 2.2 Setup Python Environment

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install WhatsApp bot dependencies
pip install psycopg2-binary twilio
```

#### 2.3 Configure Environment Variables

```bash
# Create production .env file
cat > /home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/backend/.env << EOF
DATABASE_URL=postgresql://neondb_owner:npg_T1B5gmEGbSWq@ep-polished-resonance-ah0msyvm-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=AIzaSyC0NIyCVMGJQbOdYuBjor3yg3BjRWWh664
ENVIRONMENT=production
LOG_LEVEL=INFO
EOF

# Secure the file
chmod 600 .env
```

#### 2.4 Integrate WhatsApp Bot

```bash
# Add WhatsApp router to main.py
cat >> /home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/backend/main.py << 'EOF'

# WhatsApp Bot Integration
import sys
sys.path.append('../ai-side')
from whatsapp_model_deployed import router as whatsapp_router
app.include_router(whatsapp_router)
EOF
```

---

### Phase 3: Process Management with Supervisor

#### 3.1 Create Supervisor Configuration

```bash
sudo nano /etc/supervisor/conf.d/medicova.conf
```

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

#### 3.2 Create Log Directory

```bash
sudo mkdir -p /var/log/medicova
sudo chown ubuntu:ubuntu /var/log/medicova
```

#### 3.3 Start Application

```bash
# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update

# Start application
sudo supervisorctl start medicova-backend

# Check status
sudo supervisorctl status medicova-backend
```

---

### Phase 4: Nginx Reverse Proxy

#### 4.1 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/medicova
```

```nginx
server {
    listen 80;
    server_name api.medicova.com;  # Replace with your domain

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (no rate limit)
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        access_log off;
    }
}
```

#### 4.2 Enable Site

```bash
# Enable configuration
sudo ln -s /etc/nginx/sites-available/medicova /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 4.3 SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.medicova.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

### Phase 5: Auto-Scaling & Load Balancing

#### 5.1 Create AMI (Amazon Machine Image)

```bash
# AWS Console → EC2 → Instances → Select Instance → Actions → Image and templates → Create image

Name: medicova-backend-v1
Description: Medicova backend with WhatsApp bot
```

#### 5.2 Create Launch Template

```yaml
Name: medicova-backend-template
AMI: medicova-backend-v1 (from step 5.1)
Instance Type: t3.medium
Key Pair: medicova-prod
Security Group: medicova-backend-sg
User Data:
  #!/bin/bash
  cd /home/ubuntu/Medicova_AI_Pharmacovigilance_Platform/medicircle-connect/backend
  source ../venv/bin/activate
  sudo supervisorctl restart medicova-backend
```

#### 5.3 Create Auto Scaling Group

```yaml
Name: medicova-asg
Launch Template: medicova-backend-template
Min Instances: 2
Desired Instances: 2
Max Instances: 5

Scaling Policies:
  - Target Tracking: CPU Utilization > 70% → Scale Out
  - Target Tracking: CPU Utilization < 30% → Scale In
  - Target Tracking: Request Count > 1000/min → Scale Out

Health Checks:
  - Type: ELB
  - Grace Period: 300 seconds
  - Endpoint: /health
```

#### 5.4 Create Application Load Balancer

```yaml
Name: medicova-alb
Scheme: Internet-facing
Listeners:
  - Port 80 (HTTP) → Redirect to 443
  - Port 443 (HTTPS) → Target Group

Target Group:
  Name: medicova-targets
  Protocol: HTTP
  Port: 8000
  Health Check: /health
  Healthy Threshold: 2
  Unhealthy Threshold: 3
  Interval: 30 seconds
```

---

### Phase 6: Edge Computing with CloudFront

#### 6.1 Create CloudFront Distribution

```yaml
Origin:
  Domain: medicova-alb-123456789.us-east-1.elb.amazonaws.com
  Protocol: HTTPS only

Cache Behaviors:
  - Path: /whatsapp/* → Cache: No (dynamic)
  - Path: /api/* → Cache: No (dynamic)
  - Path: /static/* → Cache: Yes (1 day TTL)

Edge Locations: All (Global)

Custom Domain: api.medicova.com
SSL Certificate: ACM Certificate

WAF: Enable (DDoS protection)
```

#### 6.2 Benefits of Edge Computing

1. **Low Latency**: CloudFront caches static content at 450+ edge locations worldwide
2. **DDoS Protection**: AWS Shield Standard included
3. **Geographic Distribution**: Users connect to nearest edge location
4. **Reduced Backend Load**: Static assets served from edge, not EC2

---

### Phase 7: Monitoring & Alerts

#### 7.1 CloudWatch Alarms

```bash
# CPU Utilization Alert
aws cloudwatch put-metric-alarm \
  --alarm-name medicova-high-cpu \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789:medicova-alerts

# Error Rate Alert
aws cloudwatch put-metric-alarm \
  --alarm-name medicova-high-errors \
  --metric-name 5XXError \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

#### 7.2 Application Logging

```python
# backend/main.py - Add structured logging
import logging
from pythonjsonlogger import jsonlogger

logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    logger.info({
        "path": request.url.path,
        "method": request.method,
        "status": response.status_code,
        "duration": duration,
        "client_ip": request.client.host
    })
    
    return response
```

#### 7.3 CloudWatch Dashboard

Create dashboard with:
- Request count per minute
- Average response time
- Error rate (4xx, 5xx)
- CPU & Memory utilization
- Database connection pool status
- WhatsApp message volume

---

### Phase 8: Database Optimization

#### 8.1 Connection Pooling

```python
# backend/database.py
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,  # Max connections per instance
    max_overflow=10,  # Additional connections if needed
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600  # Recycle connections every hour
)
```

#### 8.2 Read Replicas (Neon DB)

```python
# Separate read/write connections
WRITE_DB_URL = os.getenv("DATABASE_URL")  # Primary
READ_DB_URL = os.getenv("READ_REPLICA_URL")  # Replica

# Use read replica for analytics queries
@app.get("/api/stats")
async def get_stats():
    conn = psycopg2.connect(READ_DB_URL)  # Read from replica
    # ... query logic
```

---

## 📊 Scalability Strategy

### Horizontal Scaling (Auto-Scaling)

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU > 70% | 2 min | Add 1 instance |
| CPU < 30% | 5 min | Remove 1 instance |
| Requests > 1000/min | 1 min | Add 1 instance |
| Queue depth > 100 | 1 min | Add 1 instance |

### Vertical Scaling (Instance Types)

| Traffic Level | Instance Type | vCPU | RAM | Cost/month |
|---------------|---------------|------|-----|------------|
| Low (< 100 users) | t3.small | 2 | 2GB | $15 |
| Medium (< 1000 users) | t3.medium | 2 | 4GB | $30 |
| High (< 10k users) | t3.large | 2 | 8GB | $60 |
| Very High (> 10k) | c6i.xlarge | 4 | 8GB | $120 |

### Edge Computing Benefits

1. **Latency Reduction**: 50-80% faster response times for global users
2. **Cost Optimization**: Reduced data transfer costs from EC2
3. **Availability**: 99.99% uptime SLA with CloudFront
4. **Security**: DDoS protection, WAF rules, geo-blocking

---

## 💰 Cost Estimation (Monthly)

| Service | Configuration | Cost |
|---------|--------------|------|
| EC2 (2x t3.medium) | 24/7 uptime | $60 |
| Application Load Balancer | Standard | $20 |
| CloudFront | 1TB data transfer | $85 |
| Neon DB | Pro plan | $19 |
| CloudWatch | Logs + Metrics | $10 |
| Route 53 | DNS hosting | $1 |
| **Total** | | **$195/month** |

**With Auto-Scaling (peak traffic):**
- 5x EC2 instances: $150
- Total: ~$285/month

---

## 🔧 Maintenance & Updates

### Zero-Downtime Deployment

```bash
# 1. Update code on new instances
git pull origin main

# 2. Rolling update via Auto Scaling Group
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name medicova-asg \
  --preferences MinHealthyPercentage=50

# 3. Monitor deployment
aws autoscaling describe-instance-refreshes \
  --auto-scaling-group-name medicova-asg
```

### Backup Strategy

```bash
# Daily database backups (Neon DB auto-backup enabled)
# Weekly AMI snapshots
aws ec2 create-image \
  --instance-id i-1234567890abcdef0 \
  --name "medicova-backup-$(date +%Y%m%d)"
```

---

## 📈 Next Steps

1. ✅ Create `bot_session` table in database
2. ✅ Add router to `main.py`
3. ✅ Test locally with ngrok
4. ✅ Configure Twilio webhook
5. ✅ Test full conversation flow
6. ⏳ Launch EC2 instance and configure
7. ⏳ Set up Auto Scaling Group
8. ⏳ Configure CloudFront for edge computing
9. ⏳ Update Twilio webhook to production URL
10. ⏳ Monitor and optimize performance

---

## 💡 Future Enhancements

1. **AI Integration**: Replace keyword-based severity with Gemini AI analysis
2. **Image Support**: Handle medicine photos via Twilio media messages
3. **Multi-language**: Add Hindi, Tamil, Telugu support
4. **Voice Messages**: Transcribe and process voice notes
5. **Follow-ups**: Automated check-ins after report submission
6. **Multi-Region Deployment**: Deploy to Mumbai (ap-south-1) for Indian users
7. **Kubernetes Migration**: Move to EKS for advanced orchestration

---

**Estimated Setup Time**: 10-15 minutes  
**Production Readiness**: ✅ Ready to deploy
