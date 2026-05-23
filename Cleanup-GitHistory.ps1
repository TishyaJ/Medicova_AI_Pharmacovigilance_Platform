#!/usr/bin/env powershell
# Git History Cleanup Script for Medicova Project
# Removes exposed .env files from public GitHub repository
# WARNING: This rewrites git history and force-pushes to GitHub

param(
    [ValidateSet("bfg", "filter-branch")]
    [string]$Method = "filter-branch",
    
    [switch]$SkipBackup = $false,
    [switch]$SkipRotateWarning = $false,
    [switch]$ForcePush = $false
)

function Write-Banner {
    param([string]$Text)
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║ $Text" -PadRight 60 | Write-Host -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
}

function Test-RepoHealth {
    Write-Host "🔍 Checking repository health..." -ForegroundColor Cyan
    
    # Verify we're in the right directory
    if (-not (Test-Path ".git")) {
        Write-Host "❌ ERROR: Not in a git repository!" -ForegroundColor Red
        exit 1
    }
    
    # Check for uncommitted changes
    $status = git status --porcelain
    if ($status) {
        Write-Host "❌ ERROR: Repository has uncommitted changes!" -ForegroundColor Red
        Write-Host "Please commit or stash changes before proceeding." -ForegroundColor Yellow
        git status
        exit 1
    }
    
    # Verify remote
    $remote = git remote -v
    Write-Host "Remote configured: $remote" -ForegroundColor Green
    
    Write-Host "✓ Repository health check passed" -ForegroundColor Green
}

function Create-Backup {
    Write-Host "💾 Creating backup..." -ForegroundColor Cyan
    
    $backupName = "backup-medicova-$(Get-Date -Format 'yyyyMMdd-HHmmss').git"
    $backupPath = "..\$backupName"
    
    try {
        git clone --mirror . $backupPath
        Write-Host "✓ Backup created: $backupName" -ForegroundColor Green
        return $backupPath
    }
    catch {
        Write-Host "❌ Backup failed: $_" -ForegroundColor Red
        return $null
    }
}

function Check-Exposed-Files {
    Write-Host "🔍 Checking for exposed files in history..." -ForegroundColor Cyan
    
    $commits = git log --all --full-history --format="%H %s" -- backend/.env ai-side/.env
    
    if ($commits) {
        Write-Host "⚠️  Found commits with .env files:" -ForegroundColor Yellow
        $commits | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
        return $true
    }
    else {
        Write-Host "✓ No .env files found in history" -ForegroundColor Green
        return $false
    }
}

function Clean-Using-FilterBranch {
    Write-Host "🔧 Running git-filter-branch..." -ForegroundColor Cyan
    
    try {
        $cmd = @(
            'git', 'filter-branch', '--force', '--index-filter',
            'git rm --cached --ignore-unmatch backend/.env ai-side/.env',
            '--prune-empty', '--tag-name-filter', 'cat', '--', '--all'
        )
        
        & $cmd[0] $cmd[1] $cmd[2] $cmd[3] $cmd[4] $cmd[5] $cmd[6] $cmd[7] $cmd[8] $cmd[9] $cmd[10] $cmd[11] $cmd[12]
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ git-filter-branch completed successfully" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "❌ git-filter-branch failed with exit code $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error running git-filter-branch: $_" -ForegroundColor Red
        return $false
    }
}

function Clean-Using-BFG {
    Write-Host "🔧 Running BFG Repo-Cleaner..." -ForegroundColor Cyan
    
    # Check if BFG is available
    try {
        $version = bfg --version
        Write-Host "Using: $version" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ BFG not found. Please install from: https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Red
        return $false
    }
    
    try {
        bfg --delete-files backend/.env
        bfg --delete-files ai-side/.env
        
        Write-Host "✓ BFG completed successfully" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ BFG failed: $_" -ForegroundColor Red
        return $false
    }
}

function Cleanup-Reflog {
    Write-Host "🗑️  Cleaning reflog and garbage collection..." -ForegroundColor Cyan
    
    try {
        git reflog expire --expire=now --all
        git gc --prune=now --aggressive
        Write-Host "✓ Cleanup completed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Cleanup failed: $_" -ForegroundColor Red
        return $false
    }
}

function Verify-Removal {
    Write-Host "✅ Verifying files removed from history..." -ForegroundColor Cyan
    
    $remaining = git log --all --full-history --format="%H" -- backend/.env ai-side/.env
    
    if ($remaining) {
        Write-Host "⚠️  WARNING: Files still exist in some commits!" -ForegroundColor Yellow
        return $false
    }
    else {
        Write-Host "✓ Confirmed: .env files removed from all history" -ForegroundColor Green
        return $true
    }
}

function Force-Push-To-GitHub {
    Write-Host ""
    Write-Banner "FORCE PUSH TO GITHUB - THIS IS DESTRUCTIVE"
    Write-Host ""
    Write-Host "This will OVERWRITE the public GitHub repository history." -ForegroundColor Red
    Write-Host "All collaborators will need to run: git pull --rebase" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $ForcePush) {
        $response = Read-Host "Continue with force push? (yes/no)"
        if ($response -ne "yes") {
            Write-Host "❌ Force push cancelled" -ForegroundColor Yellow
            return $false
        }
    }
    
    try {
        Write-Host "Pushing branches..." -ForegroundColor Cyan
        git push origin --force --all
        
        Write-Host "Pushing tags..." -ForegroundColor Cyan
        git push origin --force --tags
        
        Write-Host "✓ Force push completed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Force push failed: $_" -ForegroundColor Red
        return $false
    }
}

# Main execution
function Main {
    Write-Banner "GIT HISTORY CLEANUP - REMOVE EXPOSED .env FILES"
    
    # Pre-flight checks
    if (-not $SkipRotateWarning) {
        Write-Host "⚠️  CRITICAL: Before proceeding, you MUST rotate all credentials!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Required rotations:" -ForegroundColor Yellow
        Write-Host "  1. Google Gemini API - Generate new key" -ForegroundColor Yellow
        Write-Host "  2. PostgreSQL password - Reset in Neon" -ForegroundColor Yellow
        Write-Host "  3. Ngrok token - Revoke and generate new" -ForegroundColor Yellow
        Write-Host ""
        
        if (-not $SkipRotateWarning) {
            $response = Read-Host "Have you rotated ALL credentials? (yes/no)"
            if ($response -ne "yes") {
                Write-Host "❌ Aborted. Please rotate credentials first." -ForegroundColor Red
                exit 1
            }
        }
    }
    
    # Step 1: Test repo health
    Test-RepoHealth
    
    # Step 2: Create backup
    if (-not $SkipBackup) {
        $backup = Create-Backup
        if (-not $backup) {
            Write-Host "❌ Backup creation failed. Aborting." -ForegroundColor Red
            exit 1
        }
    }
    
    # Step 3: Check for exposed files
    if (-not (Check-Exposed-Files)) {
        Write-Host "✅ No exposed files found. Nothing to clean." -ForegroundColor Green
        exit 0
    }
    
    # Step 4: Clean history
    $cleaned = $false
    if ($Method -eq "bfg") {
        $cleaned = Clean-Using-BFG
    }
    else {
        $cleaned = Clean-Using-FilterBranch
    }
    
    if (-not $cleaned) {
        Write-Host "❌ History cleaning failed. Check errors above." -ForegroundColor Red
        exit 1
    }
    
    # Step 5: Cleanup reflog
    Cleanup-Reflog
    
    # Step 6: Verify
    Verify-Removal
    
    # Step 7: Force push
    Force-Push-To-GitHub
    
    Write-Banner "CLEANUP COMPLETE"
    Write-Host "✓ Git history cleaned" -ForegroundColor Green
    Write-Host "✓ Secrets removed from public repository" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Wait 1 minute for GitHub to update" -ForegroundColor Gray
    Write-Host "  2. Verify at: https://github.com/TishyaJ/Medicova_AI_Pharmacovigilance_Platform" -ForegroundColor Gray
    Write-Host "  3. Notify collaborators to run: git pull --rebase" -ForegroundColor Gray
    Write-Host ""
}

# Run main
Main
