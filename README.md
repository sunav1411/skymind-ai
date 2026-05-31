# SkyMind AI

SkyMind AI is a fully integrated flight intelligence platform built as one connected full-stack application. It combines a premium React dashboard with a FastAPI backend and a Gradient Boosting machine learning model to predict flight delay risk, estimate disruption severity, and surface network analytics in a recruiter-ready aviation interface.

Tagline: `Predict Smarter. Fly Better.`

## What is included

- Premium dark aerospace UI built with React, Vite, Tailwind CSS, Framer Motion, and Recharts
- FastAPI backend with live REST endpoints for prediction, analytics, and flight exploration
- Synthetic but realistic airline network dataset with 10,000 flights across 10 airlines and 20 U.S. airports
- GradientBoostingClassifier delay model trained automatically at backend startup
- Fully wired prediction form with real backend inference
- Interactive dashboard, analytics views, and flight manifest table
- Windows one-click startup script via `run_project.bat`

## Tech stack

Frontend:
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts

Backend:
- FastAPI
- Uvicorn
- Pydantic

Machine learning:
- Pandas
- NumPy
- Scikit-learn
- GradientBoostingClassifier

## Application pages

- `Dashboard`
  - KPI cards
  - delay trend by hour
  - airline on-time comparison
  - top delay airports

- `Predict`
  - operational risk input form
  - real ML prediction response
  - delay probability
  - risk level
  - estimated delay minutes
  - confidence score
  - factor breakdown
  - AI explanation

- `Analytics`
  - monthly delay trend
  - day-of-week delays
  - airport risk matrix
  - airline comparison

- `Flights`
  - searchable manifest
  - airline, status, and origin filters
  - paginated flight table

## Backend endpoints

- `GET /health`
- `POST /api/predict`
- `GET /api/analytics/summary`
- `GET /api/analytics/by-airline`
- `GET /api/analytics/by-hour`
- `GET /api/analytics/by-airport`
- `GET /api/analytics/monthly`
- `GET /api/analytics/by-day`
- `GET /api/flights`
- `GET /api/flights/options`

## Local startup

The project is designed to run locally from one command:

```bat
run_project.bat
```

That script:

1. installs missing frontend dependencies
2. installs backend Python dependencies
3. starts FastAPI on `http://127.0.0.1:8000`
4. starts the Vite dev server on `http://127.0.0.1:5173`
5. opens the browser automatically

## Manual setup

Backend:

```powershell
cd "C:\Users\9esun\OneDrive\Desktop\skymind ai\backend"
Copy-Item .env.example .env
py -3.12 -m pip install --user -r requirements.txt
py -3.12 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd "C:\Users\9esun\OneDrive\Desktop\skymind ai\frontend"
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

## Project structure

```text
skymind-ai/
|-- backend/
|   |-- main.py
|   |-- model.py
|   |-- data_generator.py
|   |-- routes/
|   |   |-- predict.py
|   |   |-- analytics.py
|   |   `-- flights.py
|   |-- requirements.txt
|   `-- .env.example
|-- frontend/
|   |-- src/
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   |-- api/
|   |   |   `-- client.ts
|   |   |-- components/
|   |   |-- pages/
|   |   |-- styles/
|   |   `-- types.ts
|   |-- package.json
|   |-- vite.config.ts
|   `-- .env.example
|-- README.md
|-- architecture.md
|-- setup-guide.md
`-- run_project.bat
```

## Verified status

The current implementation has been verified locally for:

- backend startup
- model training on startup
- prediction API response
- analytics APIs
- flight options and pagination APIs
- frontend production build
- frontend and backend integration contract

Latest verified backend model accuracy:
- `83.2%`

## Important note about data

This version uses a synthetic but realistic airline operations dataset generated at backend startup. The dataset is deterministic, uses real IATA airport codes, route distances computed from airport coordinates, and engineered operational signals such as weather severity, congestion, fleet age, and carrier delay history.

## Supporting docs

- [architecture.md](</C:/Users/9esun/OneDrive/Desktop/skymind ai/architecture.md>)
- [setup-guide.md](</C:/Users/9esun/OneDrive/Desktop/skymind ai/setup-guide.md>)
- [run_project.bat](</C:/Users/9esun/OneDrive/Desktop/skymind ai/run_project.bat>)
