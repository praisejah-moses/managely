@echo off
REM Batch script to seed projects on Windows
REM Usage: seed-projects.bat <email> <password>

if "%~1"=="" (
    echo Usage: seed-projects.bat ^<email^> ^<password^>
    echo Example: seed-projects.bat admin@example.com password123
    exit /b 1
)

if "%~2"=="" (
    echo Usage: seed-projects.bat ^<email^> ^<password^>
    echo Example: seed-projects.bat admin@example.com password123
    exit /b 1
)

node seed-projects.js %1 %2
