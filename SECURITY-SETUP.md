fore tha# 🔐 Security Setup Guide

This directory contains security tools and pre-commit hooks to prevent accidental exposure of sensitive credentials.

## What's Included

### 1. **Pre-commit Hooks** (`.githooks/`)
Automatically blocks commits that contain:
- `.env` files with credentials
- Hardcoded API keys or database URLs
- Jupyter notebooks with embedded secrets

### 2. **Secret History Checker** (`check_secrets_in_history.py`)
Scans git history to identify if sensitive files were previously committed.

### 3. **Setup Scripts**
- `setup-hooks.sh` - For macOS/Linux
- `setup-hooks.ps1` - For Windows PowerShell

## 🚀 Quick Start

### Option 1: Using PowerShell (Windows)
```powershell
cd .githooks
.\setup-hooks.ps1
```

### Option 2: Using Git Bash
```bash
cd .githooks
bash setup-hooks.sh
```

### Option 3: Manual Setup
```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## ✅ Verification

After setup, test that the hook works:

```bash
# This should be blocked:
echo "SECRET=exposed" >> backend/.env
git add backend/.env
git commit -m "test"  # Should fail ❌

# This should work:
git reset HEAD backend/.env
git checkout backend/.env
git status  # Should be clean ✓
```

## 📋 Check Git History for Exposed Secrets

Run the history checker to see if secrets were previously committed:

```powershell
py -m check_secrets_in_history
```

## 🛡️ Environment Variable Best Practices

### ✅ DO:
```python
# ✓ Good: Load from .env
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
```

### ❌ DON'T:
```python
# ✗ Bad: Hardcoded credentials
API_KEY = "AIzaSyC0NIyCVMGJQbOdYuBjor3yg3BjRWWh664"
```

## 🚨 If You've Exposed Secrets

### Immediate Actions:
1. **ROTATE ALL CREDENTIALS**
   - Google Gemini API: Generate new key at https://aistudio.google.com
   - PostgreSQL: Reset database password
   - Ngrok: Revoke old token, create new one
   - Any other exposed credentials

2. **REMOVE FROM GIT HISTORY** (if repository is public)
   ```bash
   # Install BFG Repo-Cleaner (recommended)
   brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/
   
   # Remove files from history
   bfg --delete-files backend/.env --delete-files ai-side/.env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin --force --all
   ```

3. **CLEAN LOCAL FILES**
   ```bash
   rm backend/.env
   rm ai-side/.env
   ```

## 📝 Configuration

### Bypass Hook (Emergency Only)
```bash
# NOT RECOMMENDED - Only use when absolutely necessary
git commit --no-verify
```

### Customize Forbidden Files
Edit `.githooks/pre-commit` and modify the `FORBIDDEN_FILES` array:
```bash
FORBIDDEN_FILES=(
    ".env"
    ".env.local"
    "backend/.env"
    # Add more as needed
)
```

## 🔗 Required Files

Make sure these files exist:
- ✓ `backend/.env.example` - Template for backend secrets
- ✓ `ai-side/.env` - (Should NOT be committed)
- ✓ `.gitignore` - Already contains .env rules

## 📚 References

- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [OWASP: Secrets Management](https://owasp.org/www-community/attacks/Key_Logging)

## ❓ Troubleshooting

### Hook not executing
```bash
# Check if hooks are properly configured
git config core.hooksPath
# Should output: .githooks

# Make sure hook is executable
chmod +x .githooks/pre-commit
```

### Still committing .env files?
```bash
# Reinstall hooks
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

### Hook returning false positive
Review the pattern in `.githooks/pre-commit` and adjust as needed.

---

**Last Updated:** May 24, 2026
**Status:** Active Security Measures Enabled
