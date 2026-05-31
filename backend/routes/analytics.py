from __future__ import annotations

from fastapi import APIRouter, HTTPException

from state import app_state

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
def analytics_summary() -> dict[str, object]:
    dataframe = _dataset()
    delayed = dataframe.loc[dataframe["status"] == "Delayed"]
    total = len(dataframe)
    return {
        "total_flights": total,
        "delayed_flights": int((dataframe["status"] == "Delayed").sum()),
        "on_time_rate": round(float((dataframe["status"] == "On Time").sum() / total), 3),
        "avg_delay_minutes": round(float(delayed["delay_minutes"].mean()), 1),
        "worst_airport": str(
            dataframe.groupby("origin")["is_delayed"].mean().sort_values(ascending=False).index[0]
        ),
        "most_delayed_airline": str(
            dataframe.groupby("airline")["is_delayed"].mean().sort_values(ascending=False).index[0]
        ),
        "peak_delay_hour": int(
            dataframe.groupby("departure_hour")["is_delayed"].mean().sort_values(ascending=False).index[0]
        ),
        "high_risk_flights_today": int((dataframe["risk_level"] == "High").sum()),
    }


@router.get("/by-airline")
def by_airline() -> list[dict[str, object]]:
    dataframe = _dataset()
    grouped = dataframe.groupby("airline").agg(
        total=("flight_id", "count"),
        delayed=("status", lambda values: int((values == "Delayed").sum())),
        avg_delay=("delay_minutes", "mean"),
    )
    return [
        {
            "airline": airline,
            "total": int(row["total"]),
            "delayed": int(row["delayed"]),
            "on_time_rate": round(1 - (row["delayed"] / row["total"]), 3),
            "avg_delay": round(float(row["avg_delay"]), 1),
        }
        for airline, row in grouped.sort_values("delayed", ascending=False).iterrows()
    ]


@router.get("/by-hour")
def by_hour() -> list[dict[str, object]]:
    dataframe = _dataset()
    grouped = dataframe.groupby("departure_hour").agg(
        delayed_count=("status", lambda values: int((values == "Delayed").sum())),
        total=("flight_id", "count"),
    )
    return [
        {
            "hour": int(hour),
            "delayed_count": int(row["delayed_count"]),
            "total": int(row["total"]),
            "delay_rate": round(float(row["delayed_count"] / row["total"]), 3),
        }
        for hour, row in grouped.iterrows()
    ]


@router.get("/by-airport")
def by_airport() -> list[dict[str, object]]:
    dataframe = _dataset()
    grouped = dataframe.groupby("origin").agg(
        delayed_count=("status", lambda values: int((values == "Delayed").sum())),
        total=("flight_id", "count"),
    )
    grouped["delay_rate"] = grouped["delayed_count"] / grouped["total"]
    return [
        {
            "airport": airport,
            "delayed_count": int(row["delayed_count"]),
            "total": int(row["total"]),
            "delay_rate": round(float(row["delayed_count"] / row["total"]), 3),
        }
        for airport, row in grouped.sort_values("delay_rate", ascending=False).iterrows()
    ]


@router.get("/monthly")
def monthly() -> list[dict[str, object]]:
    dataframe = _dataset()
    grouped = dataframe.groupby("month").agg(
        delay_rate=("is_delayed", "mean"),
        avg_delay=("delay_minutes", lambda values: float(values[values > 0].mean() if (values > 0).any() else 0)),
    )
    return [
        {
            "month": int(month),
            "delay_rate": round(float(row["delay_rate"]), 3),
            "avg_delay": round(float(row["avg_delay"]), 1),
        }
        for month, row in grouped.iterrows()
    ]


@router.get("/by-day")
def by_day() -> list[dict[str, object]]:
    dataframe = _dataset()
    grouped = dataframe.groupby("day_of_week").agg(
        delay_rate=("is_delayed", "mean"),
        avg_delay=("delay_minutes", lambda values: float(values[values > 0].mean() if (values > 0).any() else 0)),
    )
    return [
        {
            "day_of_week": int(day),
            "delay_rate": round(float(row["delay_rate"]), 3),
            "avg_delay": round(float(row["avg_delay"]), 1),
        }
        for day, row in grouped.iterrows()
    ]


def _dataset():
    if app_state.flights is None:
        raise HTTPException(status_code=503, detail="Flight analytics are not ready yet.")
    return app_state.flights
