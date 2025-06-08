# Build the project
npm run build

# Ensure the build output is available before proceeding
if (-Not (Test-Path ".\build")) {
    Write-Host "Build failed or build directory missing."
    exit 1
}

# Go up two directories
cd ..\..

# Push changes to the repository
git add --all
git commit -m "Updated the learning-react app."
git push

# Go back to the learning-react directory
cd "Projects/learning-react"

# Delete any existing files in the destination before moving the build files
Remove-Item -Path ".\index.html" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\asset-manifest.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\static" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\sounds" -Recurse -Force -ErrorAction SilentlyContinue

# Move the contents of the build folder to the root of the react app
Move-Item -Path ".\build\*" -Destination "." -Force

# Deploy the changes
npm run deploy
