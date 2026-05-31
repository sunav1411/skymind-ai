from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from data_generator import estimate_carrier_delay_history
from model import predict
from state import app_state

router = APIRouter(prefix="/api", tags=["predict"])


class PredictionRequest(BaseModel):
    airline: str
    origin: str = Field(min_length=3, max_length=3)
    destination: str = Field(min_length=3, max_length=3)
    departure_hour: int = Field(ge=0, le=23)
    day_of_week: int = Field(ge=0, le=6)
    month: int = Field(ge=1, le=12)
    weather_score: float = Field(ge=0, le=1)
    airport_congestion: float = Field(ge=0, le=1)
    aircraft_age_years: int = Field(ge=1, le=25)
    distance_miles: int = Field(ge=100, le=3000)


@router.post("/predict")
def predict_flight(payload: PredictionRequest) -> dict[str, object]:
    if app_state.model is None:
        raise HTTPException(status_code=503, detail="Model is not ready yet.")

    features = payload.model_dump()
    features["carrier_delay_history"] = estimate_carrier_delay_history(
        airline=payload.airline,
        departure_hour=payload.departure_hour,
        month=payload.month,
    )
    result = predict(app_state.model, features)
    return result
