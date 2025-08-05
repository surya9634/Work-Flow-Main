@echo off
echo ========================================
echo    WorkFlow GitHub Upload Script
echo ========================================
echo.

echo Step 1: Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
)
echo ✓ Git is installed
echo.

echo Step 2: Initializing Git repository...
git init
echo ✓ Git repository initialized
echo.

echo Step 3: Adding all files to staging...
git add .
echo ✓ All files added to staging
echo.

echo Step 4: Creating initial commit...
git commit -m "Initial commit: WorkFlow automation platform with Instagram, Facebook, WhatsApp, and AI integration"
echo ✓ Initial commit created
echo.

echo Step 5: Setting up remote repository...
echo.
echo IMPORTANT: You need to create a GitHub repository first!
echo 1. Go to https://github.com
echo 2. Click "+" → "New repository"
echo 3. Name it: work-flow-automation
echo 4. Make it Public or Private
echo 5. DON'T initialize with README (we already have one)
echo 6. Click "Create repository"
echo.
echo After creating the repository, enter your GitHub username:
set /p github_username="GitHub Username: "

echo.
echo Step 6: Adding remote origin...
git remote add origin https://github.com/%github_username%/work-flow-automation.git
echo ✓ Remote origin added
echo.

echo Step 7: Pushing to GitHub...
git branch -M main
git push -u origin main
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo    SUCCESS! 🎉
    echo ========================================
    echo Your WorkFlow project has been uploaded to GitHub!
    echo Repository URL: https://github.com/%github_username%/work-flow-automation
    echo.
    echo Next steps:
    echo 1. Go to Vercel.com
    echo 2. Import your GitHub repository
    echo 3. Add environment variables
    echo 4. Deploy!
    echo.
) else (
    echo ========================================
    echo    ERROR! ❌
    echo ========================================
    echo Failed to push to GitHub.
    echo Please check your GitHub credentials and try again.
    echo.
)

pause 