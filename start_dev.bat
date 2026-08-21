@echo off
echo ===================================================
echo   Autonomous Multi-Signal Payment Fraud Prevention
echo ===================================================
echo.

echo Starting Backend Server (FastAPI on Port 8000)...
start cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo Starting Frontend Server (Vite on Port 5173)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Both servers are launching!
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo ===================================================
pause
