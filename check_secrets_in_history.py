#!/usr/bin/env python3
"""
Script to check git history for exposed .env files and other secrets.
This helps identify if sensitive files were previously committed.

Usage:
    py -m check_secrets_in_history
    
Optional arguments:
    --verbose    Show detailed output for each commit
    --fix        Attempt to list remediation steps
"""

import subprocess
import sys
import os
from pathlib import Path

def run_git_command(cmd):
    """Run a git command and return output."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=os.getcwd())
        return result.stdout, result.stderr, result.returncode
    except Exception as e:
        print(f"Error running command: {e}")
        return "", str(e), 1

def check_env_files_in_history():
    """Check if .env files appear in git history."""
    print("=" * 70)
    print("🔍 CHECKING GIT HISTORY FOR EXPOSED .ENV FILES")
    print("=" * 70)
    
    # Files to check for
    sensitive_files = [
        '.env',
        '.env.local',
        '.env.development',
        '.env.production',
        'backend/.env',
        'ai-side/.env',
        'ai-side/Whatsapp_Model.ipynb'
    ]
    
    found_issues = False
    
    for file in sensitive_files:
        print(f"\n📄 Checking for: {file}")
        
        # Check if file exists in any commit
        cmd = f'git log --all --full-history -- "{file}"'
        stdout, stderr, returncode = run_git_command(cmd)
        
        if returncode == 0 and stdout.strip():
            found_issues = True
            print(f"   ⚠️  FOUND IN HISTORY: {file}")
            
            # Get commit count
            cmd = f'git log --oneline --all -- "{file}" | wc -l'
            count_output, _, _ = run_git_command(cmd)
            try:
                count = int(count_output.strip())
                print(f"   📊 Appears in {count} commit(s)")
            except:
                pass
            
            # Show first and last commits
            cmd = f'git log --oneline --all -- "{file}" | head -5'
            commits, _, _ = run_git_command(cmd)
            if commits:
                print(f"   📜 Recent commits:")
                for line in commits.strip().split('\n'):
                    print(f"      {line}")
        else:
            print(f"   ✓ Not found in history (OK)")
    
    return found_issues

def check_for_secrets_in_diffs():
    """Check for common secret patterns in recent commits."""
    print("\n" + "=" * 70)
    print("🔑 CHECKING FOR SECRET PATTERNS IN DIFFS")
    print("=" * 70)
    
    secret_patterns = [
        'DATABASE_URL=postgresql',
        'GEMINI_API_KEY=',
        'SECRET_KEY=',
        'NGROK_AUTH_TOKEN=',
        'TWILIO_',
        'API_KEY=',
        'api_key',
        'password='
    ]
    
    found_secrets = False
    
    for pattern in secret_patterns:
        cmd = f'git log -p --all -S "{pattern}" -- . | head -50'
        stdout, _, returncode = run_git_command(cmd)
        
        if stdout.strip():
            found_secrets = True
            print(f"\n⚠️  Pattern found: {pattern}")
            print(f"   {stdout[:200]}...")
    
    if not found_secrets:
        print("\n✓ No obvious secret patterns found in recent diffs")
    
    return found_secrets

def print_remediation_steps():
    """Print steps to remediate exposed secrets."""
    print("\n" + "=" * 70)
    print("🛠️  REMEDIATION STEPS")
    print("=" * 70)
    
    steps = """
1. INVALIDATE ALL EXPOSED SECRETS IMMEDIATELY:
   
   a) Google Gemini API:
      - Go to https://console.cloud.google.com/
      - Invalidate the exposed key: AIzaSyC0NIyCVMGJQbOdYuBjor3yg3BjRWWh664
      - Generate a new API key
   
   b) PostgreSQL Database (Neon):
      - Access your Neon console
      - Reset database password for neondb_owner
      - Update DATABASE_URL in .env
   
   c) Ngrok Token:
      - Go to https://dashboard.ngrok.com/
      - Revoke token: 38w5AbRYF3T9OYapHg2O3TWIbWR_4rt5tbGDoxtgeNvxZYSZT
      - Generate a new token
      - Update NGROK_AUTH_TOKEN in .env

2. REMOVE FROM GIT HISTORY (if repository is public):
   
   Using BFG Repo-Cleaner (recommended):
   ```
   bfg --delete-files backend/.env,ai-side/.env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```
   
   Or using git-filter-branch:
   ```
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch backend/.env ai-side/.env' --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```

3. CLEAN UP LOCAL FILES:
   ```
   rm backend/.env
   rm ai-side/.env
   ```

4. ADD PRE-COMMIT HOOK:
   ```
   git config core.hooksPath .githooks
   ```

5. VERIFY CHANGES:
   ```
   git log --all --full-history -- backend/.env
   ```

6. FORCE PUSH TO REPOSITORY (if already public):
   ```
   git push origin --force --all
   git push origin --force --tags
   ```

7. NOTIFY TEAM/STAKEHOLDERS:
   - Document the incident
   - List all exposed credentials
   - Confirmation of rotation
"""
    
    print(steps)

def main():
    # Check if we're in a git repository
    cmd = 'git rev-parse --git-dir'
    _, stderr, returncode = run_git_command(cmd)
    
    if returncode != 0:
        print("❌ Error: Not in a git repository!")
        sys.exit(1)
    
    # Run checks
    has_env_files = check_env_files_in_history()
    has_secrets = check_for_secrets_in_diffs()
    
    # Print remediation
    print_remediation_steps()
    
    # Summary
    print("\n" + "=" * 70)
    print("📋 SUMMARY")
    print("=" * 70)
    
    if has_env_files or has_secrets:
        print("🔴 CRITICAL: Sensitive files/secrets found in git history!")
        print("\nAction required:")
        print("  1. Rotate all exposed credentials immediately")
        print("  2. Run 'bfg' or 'git-filter-branch' to remove from history")
        print("  3. Force push to clean the repository")
        sys.exit(1)
    else:
        print("✓ No .env files or obvious secrets in git history")
        sys.exit(0)

if __name__ == "__main__":
    main()
