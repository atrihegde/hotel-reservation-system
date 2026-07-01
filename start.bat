@echo off
setlocal
cd /d "%~dp0"

set REMOTE=false
if "%~1"=="--remote" set REMOTE=true

set HOST=127.0.0.1
set ACCESS_HOST=127.0.0.1
if "%REMOTE%"=="true" (
  set HOST=0.0.0.0
  set ACCESS_HOST=YOUR_SERVER_IP
)

echo Stopping existing Python and Node processes...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM python3.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM npm.exe /T >nul 2>&1

if not exist ".venv\Scripts\python.exe" (
  echo Virtual environment not found. Run setup.bat first.
  exit /b 1
)

call .venv\Scripts\activate.bat

if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  cd frontend
  npm install
  cd ..
)

echo Starting backend server...
start "Hotel Backend" cmd /k "cd /d "%~dp0backend" && python manage.py runserver %HOST%:8000"

echo Starting frontend dev server...
start "Hotel Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host %HOST%"

echo Backend running at http://%ACCESS_HOST%:8000

echo Frontend running at http://%ACCESS_HOST%:5173
