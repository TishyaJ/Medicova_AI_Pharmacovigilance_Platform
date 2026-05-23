# PowerShell script to install pre-commit hooks
# Run this once to enable the security hooks

Write-Host "Setting up pre-commit hooks..." -ForegroundColor Green

# Make the hook executable (for Git Bash)
$hookPath = ".\.githooks\pre-commit"
if (Test-Path $hookPath) {
    Write-Host "Making hook executable..." -ForegroundColor Gray
    git update-index --add --chmod=+x $hookPath
}

# Configure git to use .githooks directory
Write-Host "Configuring git to use .githooks..." -ForegroundColor Gray
git config core.hooksPath .githooks

if ($LASTEXITCODE -eq 0) {
    Write-Host "Pre-commit hook installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The following checks will run before each commit:" -ForegroundColor Cyan
    Write-Host "  - .env files will be blocked" -ForegroundColor Gray
    Write-Host "  - Hardcoded secrets will be detected" -ForegroundColor Gray
    Write-Host "  - Jupyter notebooks with credentials will be warned" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To bypass (NOT RECOMMENDED): git commit --no-verify" -ForegroundColor Yellow
} else {
    Write-Host "Failed to install hook" -ForegroundColor Red
    exit 1
}
