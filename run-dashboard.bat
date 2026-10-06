@echo off
rem Starts the Traffic Risk Dashboard: FastAPI backend (port 8000) + Vite frontend (port 5173).
rem Each server opens in its own window. Close a window (or press Ctrl+C in it) to stop that server.
setlocal
set "ROOT=%~dp0"

if not exist "%ROOT%Backend\venv\Scripts\python.exe" (
  echo [ERROR] Backend virtual environment not found at Backend\venv
  echo Create it with:  cd Backend ^&^& python -m venv venv ^&^& venv\Scripts\pip install -r requirements.txt
  pause
  exit /b 1
)
if not exist "%ROOT%Backend\.env" (
  echo [ERROR] Backend\.env is missing ^(needs MONGO_URI and MONGO_DB^).
  pause
  exit /b 1
)
if not exist "%ROOT%Frontend\node_modules\.bin\vite.cmd" (
  echo Frontend dependencies missing - running npm install first...
  pushd "%ROOT%Frontend"
  call npm install
  popd
)

start "Dashboard Backend - FastAPI :8000" /D "%ROOT%Backend" cmd /k "venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
start "Dashboard Frontend - Vite :5173" /D "%ROOT%Frontend" cmd /k "npm run dev -- --port 5173 --strictPort"

endlocal
