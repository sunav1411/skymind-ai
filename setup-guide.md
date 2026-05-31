# SkyMind AI Setup Guide

## Quick start

From the project root:

```bat
run_project.bat
```

This is the intended local startup path for Windows. It handles dependency setup, starts both services, and opens the browser.

## What `run_project.bat` does

1. moves into the project root
2. creates `frontend/.env` from `frontend/.env.example` if needed
3. creates `backend/.env` from `backend/.env.example` if needed
4. installs frontend packages if `frontend/node_modules` is missing
5. installs backend Python dependencies from `backend/requirements.txt`
6. starts FastAPI on port `8000`
7. starts Vite on port `5173`
8. opens `http://127.0.0.1:5173`

## Manual startup

### Backend

```powershell
cd "C:\Users\9esun\OneDrive\Desktop\skymind ai\backend"
Copy-Item .env.example .env
py -3.12 -m pip install --user -r requirements.txt
py -3.12 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Frontend

```powershell
cd "C:\Users\9esun\OneDrive\Desktop\skymind ai\frontend"
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

## Local URLs

- Frontend: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- Backend health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

## Environment files

Frontend `.env`:

```env
VITE_API_URL=
```

Leave it blank for local development so Vite proxying handles API calls. In production, set it to the deployed FastAPI URL.

Backend `.env`:

```env
APP_NAME=SkyMind AI API
APP_HOST=127.0.0.1
APP_PORT=8000
FRONTEND_ORIGIN=http://127.0.0.1:5173
```

The current backend does not require secrets to run locally.

## Common checks

Backend health:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" | Select-Object -ExpandProperty Content
```

Frontend build:

```powershell
cd "C:\Users\9esun\OneDrive\Desktop\skymind ai\frontend"
npm.cmd run build
```

## Expected startup behavior

When the backend starts, it will:

1. generate the flight dataset
2. train the Gradient Boosting model
3. log the training accuracy
4. expose prediction and analytics APIs

When the frontend starts, it will:

1. connect to the backend via Vite proxy
2. fetch analytics data on page load
3. render the dashboard, prediction console, analytics view, and flight table
