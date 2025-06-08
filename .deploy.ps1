# React App Deployment Script for LearningReact
# Automates building and deploying to GitHub Pages

Write-Host "Starting deployment process..." -ForegroundColor Green

# Check if we're in the correct directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Make sure you're in the LearningReact directory." -ForegroundColor Red
    exit 1
}

# Stop any running development servers
Write-Host "Stopping any running development servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean up any existing build folder to prevent file locking issues
Write-Host "Cleaning up build directory..." -ForegroundColor Yellow
if (Test-Path "build") {
    try {
        Remove-Item -Path "build" -Recurse -Force -ErrorAction Stop
        Write-Host "Build directory cleaned successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "Warning: Could not remove build directory. Continuing anyway..." -ForegroundColor Yellow
    }
}

# Build the React application
Write-Host "Building React application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Deployment aborted." -ForegroundColor Red
    exit 1
}

Write-Host "Build completed successfully!" -ForegroundColor Green

# Deploy to GitHub Pages
Write-Host "Deploying to GitHub Pages..." -ForegroundColor Yellow
npx gh-pages -d build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your site should be available at: https://wh33les.github.io/LearningReact" -ForegroundColor Cyan

# Optional: Open the deployed site in browser
$response = Read-Host "Do you want to open the deployed site in your browser? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Start-Process "https://wh33les.github.io/LearningReact"
}

Write-Host "Deployment process complete!" -ForegroundColor Green