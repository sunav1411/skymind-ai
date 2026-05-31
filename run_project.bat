@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo ==================================================
echo SkyMind AI - Smart Flight Intelligence Platform
echo ==================================================

if not exist "frontend\.env" (
  copy /y "frontend\.env.example" "frontend\.env" >nul
)

if not exist "backend\.env" (
  copy /y "backend\.env.example" "backend\.env" >nul
)

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm are required.
  pause
  exit /b 1
)

py -3.12 --version >nul 2>nul
if errorlevel 1 (
  py --version >nul 2>nul
  if errorlevel 1 (
    echo Python launcher was not found. Install Python 3.12 and try again.
    pause
    exit /b 1
  )
  set "PYTHON_CMD=py"
) else (
  set "PYTHON_CMD=py -3.12"
)

if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  call npm.cmd --prefix frontend install
  if errorlevel 1 goto :error
)

echo Checking backend dependencies...
call %PYTHON_CMD% -m pip install --disable-pip-version-check --user -r backend\requirements.txt
if errorlevel 1 goto :error

echo Starting backend on http://127.0.0.1:8000 ...
start "SkyMind Backend" cmd /k "cd /d ""%ROOT%backend"" && %PYTHON_CMD% -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo Starting frontend on http://127.0.0.1:5173 ...
start "SkyMind Frontend" cmd /k "cd /d ""%ROOT%frontend"" && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

echo Waiting for services to boot...
timeout /t 12 /nobreak >nul

start "" "http://127.0.0.1:5173"
echo SkyMind AI is launching in your browser.
exit /b 0

:error
echo.
echo SkyMind AI startup failed.
pause
exit /b 1
