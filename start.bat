@echo off
setlocal
cd /d "%~dp0"

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
start "Hotel Backend" cmd /k "cd /d "%~dp0backend" && python manage.py runserver 0.0.0.0:8000"

echo Starting frontend dev server...
start "Hotel Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0"

echo Backend running at http://localhost:8000

echo Frontend running at http://localhost:5173
