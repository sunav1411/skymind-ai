from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from data_generator import AIRLINES, AIRPORTS, ROUTE_DISTANCE_MILES
from state import app_state

router = APIRouter(prefix="/api/flights", tags=["flights"])


@router.get("")
def list_flights(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    airline: str = "",
    origin: str = "",
    status: str = "",
    search: str = "",
) -> dict[str, object]:
    dataframe = _dataset()
    filtered = dataframe.copy()

    if airline:
        filtered = filtered.loc[filtered["airline"] == airline]
    if origin:
        filtered = filtered.loc[filtered["origin"] == origin]
    if status:
        filtered = filtered.loc[filtered["status"].str.lower() == status.lower()]
    if search:
        lowered = search.lower()
        filtered = filtered.loc[
            filtered["flight_id"].str.lower().str.contains(lowered)
            | filtered["airline"].str.lower().str.contains(lowered)
            | filtered["origin"].str.lower().str.contains(lowered)
            | filtered["destination"].str.lower().str.contains(lowered)
        ]

    total = len(filtered)
    start = (page - 1) * per_page
    end = start + per_page
    page_rows = filtered.iloc[start:end]

    return {
        "page": page,
        "per_page": per_page,
        "total": total,
        "items": [
            {
                "flight_id": row["flight_id"],
                "airline": row["airline"],
                "origin": row["origin"],
                "destination": row["destination"],
                "scheduled_departure": row["scheduled_departure"].isoformat(),
                "status": row["status"],
                "delay_minutes": int(row["delay_minutes"]),
                "risk_level": row["risk_level"],
            }
            for _, row in page_rows.iterrows()
        ],
    }


@router.get("/options")
def flight_options() -> dict[str, object]:
    return {
        "airlines": AIRLINES,
        "airports": AIRPORTS,
        "route_distance_miles": ROUTE_DISTANCE_MILES,
    }


def _dataset():
    if app_state.flights is None:
        raise HTTPException(status_code=503, detail="Flight data is not ready yet.")
    return app_state.flights
