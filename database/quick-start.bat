@echo off
REM MediaPortal Database Quick Start Script (Windows)
REM This script sets up the entire database with one command

setlocal enabledelayedexpansion

REM Database configuration
set DB_NAME=ephrathahstream
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo ========================================
echo   MediaPortal Database Setup
echo ========================================
echo.

REM Step 1: Check if PostgreSQL is accessible
echo [1/5] Checking PostgreSQL connection...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -c "\q" 2>nul
if errorlevel 1 (
    echo ERROR: Cannot connect to PostgreSQL
    echo Please make sure PostgreSQL is running and you have the correct credentials.
    pause
    exit /b 1
)
echo DONE: PostgreSQL is running
echo.

REM Step 2: Create database
echo [2/5] Creating database '%DB_NAME%'...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -c "DROP DATABASE IF EXISTS %DB_NAME%;" 2>nul
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -c "CREATE DATABASE %DB_NAME%;"
if errorlevel 1 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)
echo DONE: Database created
echo.

REM Step 3: Run setup script
echo [3/5] Creating tables, indexes, and triggers...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -f "%~dp0setup.sql" >nul
if errorlevel 1 (
    echo ERROR: Failed to create database structure
    pause
    exit /b 1
)
echo DONE: Database structure created
echo.

REM Step 4: Ask about seed data
echo [4/5] Do you want to add sample data for testing? (Y/N)
set /p response=
if /i "%response%"=="Y" (
    psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -f "%~dp0seed.sql"
    echo DONE: Sample data added
) else (
    echo SKIPPED: Sample data
)
echo.

REM Step 5: Verify setup
echo [5/5] Verifying setup...
for /f %%i in ('psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"') do set TABLE_COUNT=%%i
for /f %%i in ('psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM users;"') do set USER_COUNT=%%i
echo DONE: Setup verified
echo.

REM Summary
echo ========================================
echo   Setup completed successfully!
echo ========================================
echo.
echo Database: %DB_NAME%
echo Tables created: %TABLE_COUNT%
echo Users in database: %USER_COUNT%
echo.
echo Connection string:
echo postgresql://%DB_USER%:PASSWORD@%DB_HOST%:%DB_PORT%/%DB_NAME%?schema=public
echo.
echo Next steps:
echo 1. Update your backend/.env file with the database connection string
echo 2. Run: npm run dev (from project root)
echo 3. Access the application at http://localhost:4200
echo.
pause
