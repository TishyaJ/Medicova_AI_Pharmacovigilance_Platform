# Clean Git History of Exposed .env Files

**Status:** YOUR REPO IS PUBLIC ON GITHUB 🔴  
**Found:** 3 commits with exposed `backend/.env`

---

## ⚠️ CRITICAL STEPS

Before running ANY cleanup:

```powershell
# 1. Backup your repo (just in case)
cd d:\desktop\projects\INNOVA_RGIPT_MEDICOVA\medicircle-connect
git clone --mirror . backup-medicova.git

# 2. ROTATE ALL CREDENTIALS FIRST (before cleaning history)
# This is MANDATORY - if you clean history without rotating, 
# someone could restore the old commits and find the secrets
```

---

## Option 1: Using BFG Repo-Cleaner (Recommended)

### Install BFG
```powershell
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
# Or install via Chocolatey if you have it:
choco install bfg

# Or download JAR directly and use Java:
# 1. Download bfg-1.14.0.jar from https://rtyley.github.io/bfg-repo-cleaner/
# 2. Place in a known location
# 3. Use: java -jar bfg-1.14.0.jar --delete-files backend/.env [repo-path]
```

### After BFG Installation, Run This:

```powershell
cd d:\desktop\projects\INNOVA_RGIPT_MEDICOVA\medicircle-connect

# Step 1: Delete the .env files from all commits
bfg --delete-files backend/.env
bfg --delete-files ai-side/.env

# Step 2: Clean up the git reflog and garbage collect
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Step 3: Verify the files are gone from history
git log --all --full-history --name-only -- backend/.env
# Should show: Nothing, or no commits

# Step 4: Force push to GitHub (⚠️ DESTRUCTIVE - OVERWRITES HISTORY)
git push origin --force --all
git push origin --force --tags

# Step 5: Tell collaborators
echo "WARNING: Repository history was rewritten. Please run: git pull --rebase"
```

---

## Option 2: Using git-filter-branch (No External Tools)

### PowerShell Script (Windows)

```powershell
# Step 1: Navigate to repo
cd d:\desktop\projects\INNOVA_RGIPT_MEDICOVA\medicircle-connect

# Step 2: Create a backup
git clone --mirror . backup-medicova.git

# Step 3: Use git-filter-branch to remove files
# (This will take a few minutes)
git filter-branch --force --index-filter `
  'git rm --cached --ignore-unmatch backend/.env ai-side/.env' `
  --prune-empty --tag-name-filter cat -- --all

# Step 4: Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Step 5: Verify removed
git log --all --full-history --name-only -- backend/.env

# Step 6: Force push to GitHub
git push origin --force --all
git push origin --force --tags
```

---

## Step-by-Step Walkthrough (Safest Approach)

### Phase 1: Pre-Cleanup (DO FIRST)

```powershell
# 1. Make sure you're in the right repo
cd d:\desktop\projects\INNOVA_RGIPT_MEDICOVA\medicircle-connect
git config user.name  # Verify correct repo
git remote -v         # Verify GitHub URL

# 2. Check current branch
git branch -a
git log --oneline -n 5  # See recent commits

# 3. CREATE BACKUP (CRITICAL!)
git clone --mirror . backup-medicova-$(Get-Date -Format 'yyyyMMdd-HHmmss').git
# This creates a complete backup of everything
```

### Phase 2: Clean History (Choose One Option Below)

**OPTION A: BFG (Easier)**
```powershell
# Download and install BFG
# Then run:
bfg --delete-files backend/.env
bfg --delete-files ai-side/.env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**OPTION B: git-filter-branch (Built-in)**
```powershell
git filter-branch --force --index-filter `
  'git rm --cached --ignore-unmatch backend/.env ai-side/.env' `
  --prune-empty --tag-name-filter cat -- --all
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Phase 3: Verification

```powershell
# Check that files are removed from history
git log --all --full-history --name-only -- backend/.env
# Expected: No output or "no commits contain these files"

# Check commit history is intact
git log --oneline -n 10

# Verify .env files don't exist in working directory
Test-Path backend\.env
Test-Path ai-side\.env
# Expected: False, False
```

### Phase 4: Push to GitHub (DESTRUCTIVE)

⚠️ **WARNING:** This overwrites the public history. Do this during low-traffic time.

```powershell
# Make absolutely sure you want to do this:
Write-Host "About to force-push to GitHub. Press Ctrl+C to cancel."
Start-Sleep -Seconds 5

# Force push all branches
git push origin --force --all
git push origin --force --tags

# Verify on GitHub (wait 30 seconds for GitHub to update)
# Then check: https://github.com/TishyaJ/Medicova_AI_Pharmacovigilance_Platform
```

### Phase 5: Notify Collaborators

```powershell
# If others have cloned this repo, they need to:
# 1. Back up their work
# 2. Run: git pull --rebase
# 3. Or re-clone the repository
```

---

## 🚨 After Cleanup: Rotate All Credentials

**DO NOT SKIP THIS STEP!**

Even after removing from history, the secrets were exposed. You MUST rotate:

1. **Google Gemini API**
   - Delete old key: `AIzaSyC0NIyCVMGJQbOdYuBjor3yg3BjRWWh664`
   - Generate new key at https://aistudio.google.com
   - Update `.env` files

2. **PostgreSQL (Neon)**
   - Reset password for `neondb_owner`
   - Update `DATABASE_URL` in `.env`
   - Verify connection works

3. **Ngrok Token**
   - Revoke: `38w5AbRYF3T9OYapHg2O3TWIbWR_4rt5tbGDoxtgeNvxZYSZT`
   - Generate new token at https://dashboard.ngrok.com/
   - Update `.env` files

---

## Troubleshooting

### "git-filter-branch not found"
```powershell
# Install Git (should include git-filter-branch)
# Or download: https://git-scm.com/download/win
```

### "BFG command not found"
```powershell
# Download JAR: https://rtyley.github.io/bfg-repo-cleaner/
# Then use: java -jar bfg-1.14.0.jar --delete-files backend/.env .
```

### "Push rejected - repository already protected"
```powershell
# GitHub might prevent force-pushes on main branch
# Solution: In GitHub Settings > Branches, temporarily disable branch protection
# Then re-enable after pushing
```

### "Reflog still contains the commits"
```powershell
# This is normal. GitHub's reflog will expire naturally.
# To be safe, wait a few weeks before assuming the data is gone.
# Or contact GitHub support about purging reflog.
```

---

## Verification Checklist

After cleanup:

- [ ] Backup created: `backup-medicova-[date].git`
- [ ] All credentials rotated (Gemini, Neon DB, Ngrok)
- [ ] BFG or git-filter-branch executed successfully
- [ ] Reflog cleaned: `git reflog expire --expire=now --all`
- [ ] Garbage collected: `git gc --prune=now --aggressive`
- [ ] History verified: `git log --all --full-history --name-only -- backend/.env` (empty)
- [ ] Force pushed: `git push origin --force --all`
- [ ] Tags pushed: `git push origin --force --tags`
- [ ] GitHub verified (wait 1 minute then check browser)

---

## Quick Reference

**TL;DR - If you have BFG:**
```powershell
cd d:\desktop\projects\INNOVA_RGIPT_MEDICOVA\medicircle-connect
git clone --mirror . backup-$(date).git
bfg --delete-files backend/.env ai-side/.env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all --tags
```

**TL;DR - If using git-filter-branch:**
```powershell
cd d:\desktop\projects\INNOVA_RGIPT_MEDICOVA\medicircle-connect
git clone --mirror . backup-$(date).git
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch backend/.env ai-side/.env' --prune-empty --tag-name-filter cat -- --all
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all --tags
```

---

## Resources

- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- Git Filter Branch Docs: https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History
- GitHub Removing Sensitive Data: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
- Neon DB Password Reset: https://neon.tech/docs/manage/security

