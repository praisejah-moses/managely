@echo off
echo Starting server and client...

:: Start server in new window
start "Server" cmd /k "cd /d server && npm run start:dev"

:: Wait a moment before starting client
timeout /t 2 /nobreak >nul

:: Start client in new window
start "Client" cmd /k "cd /d client && npm run dev"

echo.
echo Server and client started in separate windows
echo Close the terminal windows to stop them
