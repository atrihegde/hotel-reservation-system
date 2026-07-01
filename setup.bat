@echo off
setlocal
cd /d "%~dp0"

set CREATE_SU=false
if "%~1"=="--create-su" set CREATE_SU=true

echo Stopping existing Python and Node processes...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM python3.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM npm.exe /T >nul 2>&1

echo Creating backend virtual environment in .venv...
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py -3 -m venv .venv
) else (
  python -m venv .venv
)

call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
python backend\manage.py migrate

if "%CREATE_SU%"=="true" (
  echo Creating Django superuser...
  python backend\manage.py createsuperuser
)

echo Installing frontend dependencies...
if not exist "frontend\node_modules" (
  cd frontend
  npm install
  cd ..
) else (
  echo Frontend dependencies already installed.
)

echo Setup complete.
echo Run start.bat to launch the app.
