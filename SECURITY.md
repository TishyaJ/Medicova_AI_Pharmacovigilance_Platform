# 🔐 Security & Environment Setup Guide

## ⚠️ CRITICAL: Environment Variables

This project uses environment variables to store sensitive credentials. **NEVER commit `.env` files to Git!**

### Quick Setup for Evaluators

1. **Copy the template:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Fill in your credentials:**
   Edit `backend/.env` with your actual values:
   - **DATABASE_URL**: Your Neon DB connection string
   - **GEMINI_API_KEY**: Your Google Gemini API key
   - **SECRET_KEY**: A random 32+ character string

3. **Get Free Credentials:**
   - **Neon DB**: https://neon.tech (Free tier: 10GB storage)
   - **Gemini API**: https://aistudio.google.com (Free tier: 15 req/min)

### Generate Secure SECRET_KEY

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🛡️ Security Measures Implemented

### 1. Comprehensive .gitignore
- ✅ All `.env` files excluded
- ✅ Private keys and certificates blocked
- ✅ Database backups ignored
- ✅ Credentials JSON files excluded
- ✅ 120+ security patterns

### 2. Template Files
- ✅ `.env.example` - Safe template for evaluators
- ✅ No actual credentials in repository
- ✅ Clear instructions for setup

### 3. Best Practices
- ✅ Environment variables loaded via `python-dotenv`
- ✅ API keys never hardcoded in source
- ✅ Database credentials isolated
- ✅ Separate configs for dev/prod

---

## 📋 Required Environment Variables

| Variable | Purpose | Where to Get |
|:---------|:--------|:-------------|
| `DATABASE_URL` | PostgreSQL connection | [Neon DB](https://neon.tech) |
| `GEMINI_API_KEY` | AI/ML inference | [Google AI Studio](https://aistudio.google.com) |
| `SECRET_KEY` | JWT token signing | Generate with Python (see above) |

### Optional Variables

| Variable | Purpose | Required For |
|:---------|:--------|:-------------|
| `TWILIO_ACCOUNT_SID` | WhatsApp bot | WhatsApp integration |
| `TWILIO_AUTH_TOKEN` | WhatsApp bot | WhatsApp integration |
| `ENVIRONMENT` | Deployment mode | Production deployment |
| `LOG_LEVEL` | Logging verbosity | Production monitoring |

---

## 🚨 Security Checklist

Before submitting or deploying:

- [ ] ✅ `.env` files are in `.gitignore`
- [ ] ✅ No API keys in source code
- [ ] ✅ `.env.example` has placeholder values only
- [ ] ✅ Database credentials are not hardcoded
- [ ] ✅ `git status` shows no `.env` files
- [ ] ✅ GitHub repository has no exposed secrets

### Verify No Secrets in Git

```bash
# Check if .env is tracked
git status --porcelain | grep "\.env"

# Should return nothing (empty output)
```

---

## 🔍 What's Protected

The `.gitignore` file protects:

**Environment Files:**
- `.env`, `.env.*`, `backend/.env`
- `.env.local`, `.env.production`

**Credentials:**
- `credentials.json`, `secrets.json`
- `*.pem`, `*.key`, `*.cert`

**Sensitive Data:**
- `*.sql`, `*.sqlite`, `*.db`
- Database backups and exports

**Temporary Files:**
- `*.tmp`, `*.swp`, cache files
- Jupyter checkpoints

---

## 📞 Support

If you encounter issues with environment setup:

1. **Check `.env.example`** - Ensure all required variables are set
2. **Verify credentials** - Test database connection and API keys
3. **Review logs** - Check backend console for error messages
4. **Consult README** - Full setup instructions in main README.md

---

**Last Updated:** 2026-02-01  
**Security Level:** Production-Ready ✅
