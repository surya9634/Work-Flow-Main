Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    WorkFlow GitHub Upload Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Git is installed
Write-Host "Step 1: Checking if Git is installed..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Red
    Write-Host "Then run this script again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Step 2: Initialize Git repository
Write-Host "Step 2: Initializing Git repository..." -ForegroundColor Yellow
git init
Write-Host "✓ Git repository initialized" -ForegroundColor Green
Write-Host ""

# Step 3: Add all files to staging
Write-Host "Step 3: Adding all files to staging..." -ForegroundColor Yellow
git add .
Write-Host "✓ All files added to staging" -ForegroundColor Green
Write-Host ""

# Step 4: Create initial commit
Write-Host "Step 4: Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: WorkFlow automation platform with Instagram, Facebook, WhatsApp, and AI integration"
Write-Host "✓ Initial commit created" -ForegroundColor Green
Write-Host ""

# Step 5: Get GitHub username
Write-Host "Step 5: Setting up remote repository..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: You need to create a GitHub repository first!" -ForegroundColor Red
Write-Host "1. Go to https://github.com" -ForegroundColor White
Write-Host "2. Click '+' → 'New repository'" -ForegroundColor White
Write-Host "3. Name it: work-flow-automation" -ForegroundColor White
Write-Host "4. Make it Public or Private" -ForegroundColor White
Write-Host "5. DON'T initialize with README (we already have one)" -ForegroundColor White
Write-Host "6. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$githubUsername = Read-Host "Enter your GitHub username"

# Step 6: Add remote origin
Write-Host ""
Write-Host "Step 6: Adding remote origin..." -ForegroundColor Yellow
git remote add origin "https://github.com/$githubUsername/work-flow-automation.git"
Write-Host "✓ Remote origin added" -ForegroundColor Green
Write-Host ""

# Step 7: Push to GitHub
Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "    SUCCESS! 🎉" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Your WorkFlow project has been uploaded to GitHub!" -ForegroundColor White
    Write-Host "Repository URL: https://github.com/$githubUsername/work-flow-automation" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go to Vercel.com" -ForegroundColor White
    Write-Host "2. Import your GitHub repository" -ForegroundColor White
    Write-Host "3. Add environment variables" -ForegroundColor White
    Write-Host "4. Deploy!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "    ERROR! ❌" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Failed to push to GitHub." -ForegroundColor Red
    Write-Host "Please check your GitHub credentials and try again." -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit" 