@echo off
REM WhatsApp Bot - ngrok Setup and Launch Script
REM This script helps you download and configure ngrok

echo ========================================
echo WhatsApp Bot - ngrok Setup
echo ========================================
echo.

REM Check if ngrok exists
where ngrok >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] ngrok is already installed!
    echo.
    goto :configure
)

echo [!] ngrok not found. Please download it manually:
echo.
echo 1. Go to: https://ngrok.com/download
echo 2. Download the Windows ZIP file
echo 3. Extract to C:\ngrok\ (or any folder)
echo 4. Run this script again
echo.
pause
exit /b 1

:configure
echo Configuring ngrok with your auth token...
ngrok config add-authtoken 38w5AbRYF3T9OYapHg2O3TWIbWR_4rt5tbGDoxtgeNvxZYSZT
if %ERRORLEVEL% EQU 0 (
    echo [OK] ngrok configured successfully!
) else (
    echo [ERROR] Failed to configure ngrok
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting ngrok tunnel on port 8000...
echo ========================================
echo.
echo IMPORTANT: Copy the https://xxxxx.ngrok.io URL that appears below!
echo You'll need it to configure Twilio webhook.
echo.
echo Press Ctrl+C to stop ngrok when done.
echo.

ngrok http 8000
