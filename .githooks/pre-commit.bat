@echo off
REM Pre-commit hook for Windows (PowerShell version)
REM This script prevents committing .env files and other sensitive files

setlocal enabledelayedexpansion

echo Checking for forbidden .env files...

REM List of forbidden files
set "FORBIDDEN_FILES=.env .env.local backend\.env ai-side\.env"

set "FOUND_ISSUE=0"

REM Check for forbidden files
for %%F in (%FORBIDDEN_FILES%) do (
    git diff --cached --name-only | findstr /R "^%%F$" >nul
    if not errorlevel 1 (
        echo [ERROR] Attempting to commit %%F
        set "FOUND_ISSUE=1"
    )
)

REM Check for secret patterns in staged changes
echo Checking for secret patterns...
git diff --cached 2>nul | findstr /I "DATABASE_URL GEMINI_API_KEY SECRET_KEY NGROK_AUTH_TOKEN TWILIO" >nul
if not errorlevel 1 (
    echo [WARNING] Possible credentials detected in staged changes
    echo Please review before committing
    set "FOUND_ISSUE=1"
)

if %FOUND_ISSUE% equ 1 (
    echo.
    echo ================================================================
    echo COMMIT BLOCKED: Sensitive files or patterns detected
    echo.
    echo To bypass (NOT RECOMMENDED):
    echo   git commit --no-verify
    echo.
    echo Better solution: Fix the issues and try again
    echo ================================================================
    exit /b 1
) else (
    echo [OK] No sensitive files or patterns detected
    exit /b 0
)
