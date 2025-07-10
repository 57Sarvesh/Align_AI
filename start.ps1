# Start Posture Detection App
Write-Host "Starting Posture Detection App..." -ForegroundColor Green

# Function to start backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    & "venv\Scripts\Activate.ps1"
    python main.py
}

# Wait a moment for backend to start
Start-Sleep 3

# Function to start frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm start
}

Write-Host "Backend started (Job ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "Frontend started (Job ID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "App will be available at:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both services" -ForegroundColor Yellow

try {
    while ($true) {
        Start-Sleep 1
    }
} finally {
    Write-Host "Stopping services..." -ForegroundColor Red
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
}
