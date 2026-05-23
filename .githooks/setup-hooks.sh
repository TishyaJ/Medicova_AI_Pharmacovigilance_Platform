#!/bin/bash
# Setup script to install pre-commit hooks
# Run this once to enable the security hooks

echo "Setting up pre-commit hooks..."

# Make the hook executable
chmod +x .githooks/pre-commit

# Configure git to use .githooks directory
git config core.hooksPath .githooks

if [ $? -eq 0 ]; then
    echo "✓ Pre-commit hook installed successfully!"
    echo ""
    echo "The following checks will run before each commit:"
    echo "  • .env files will be blocked"
    echo "  • Hardcoded secrets will be detected"
    echo "  • Jupyter notebooks with credentials will be warned"
    echo ""
    echo "To bypass (NOT RECOMMENDED): git commit --no-verify"
else
    echo "✗ Failed to install hook"
    exit 1
fi
