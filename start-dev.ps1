# Start both client and server concurrently
Write-Host "Starting server and client..." -ForegroundColor Green

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\PraiseJahOssai(Zorac\Documents\praisejah-test-project\server"
    npm run start:dev
}

# Start client in background
$clientJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\PraiseJahOssai(Zorac\Documents\praisejah-test-project\client"
    npm run dev
}

Write-Host "Server started (Job ID: $($serverJob.Id))" -ForegroundColor Cyan
Write-Host "Client started (Job ID: $($clientJob.Id))" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop both servers" -ForegroundColor Yellow

# Monitor both jobs and display output
try {
    while ($true) {
        # Get and display server output
        $serverOutput = Receive-Job -Job $serverJob
        if ($serverOutput) {
            Write-Host "[SERVER] $serverOutput" -ForegroundColor Blue
        }

        # Get and display client output
        $clientOutput = Receive-Job -Job $clientJob
        if ($clientOutput) {
            Write-Host "[CLIENT] $clientOutput" -ForegroundColor Magenta
        }

        # Check if jobs are still running
        if ($serverJob.State -eq 'Failed' -or $clientJob.State -eq 'Failed') {
            Write-Host "`nOne or more jobs failed!" -ForegroundColor Red
            break
        }

        Start-Sleep -Milliseconds 500
    }
}
finally {
    # Cleanup: stop both jobs when script exits
    Write-Host "`nStopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $serverJob, $clientJob
    Remove-Job -Job $serverJob, $clientJob
    Write-Host "Servers stopped." -ForegroundColor Green
}
