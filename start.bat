@echo off
echo Starting MediaPortal Application...
echo.
echo This will start both:
echo - Backend (NestJS) on http://localhost:3100
echo - Frontend (Angular) on http://localhost:4200
echo.

REM Check if node_modules exists in root
if not exist "node_modules\" (
    echo Installing root dependencies...
    call npm install
)

REM Check if backend node_modules exists
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js processes stopped successfully.
) else (
    echo No Node.js processes were running.
)

echo.
echo Starting both services...
echo Press Ctrl+C to stop both services
echo.

npm run dev
