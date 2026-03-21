@echo off
echo ===============================================
echo   Starting Online Library Backend Server
echo ===============================================
echo.

echo Checking existing backend on port 3000...
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/health' -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel%==0 (
    echo Backend is already running at http://localhost:3000
    echo No new server started.
    echo.
    pause
    exit /b 0
)

cd backend

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm start

pause
