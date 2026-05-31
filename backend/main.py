from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data_generator import generate_dataset
from model import train_model
from routes.analytics import router as analytics_router
from routes.flights import router as flights_router
from routes.predict import router as predict_router
from state import app_state


@asynccontextmanager
async def lifespan(_: FastAPI):
    app_state.flights = generate_dataset()
    app_state.model = train_model(app_state.flights)
    print(f"SkyMind model trained. Accuracy: {app_state.model.accuracy * 100:.1f}%")
    yield


app = FastAPI(
    title="SkyMind AI API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(analytics_router)
app.include_router(flights_router)


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "model_accuracy": round(app_state.model.accuracy, 4) if app_state.model else None,
    }
