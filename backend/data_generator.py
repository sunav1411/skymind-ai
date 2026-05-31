from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

AIRLINES = [
    "United",
    "Delta",
    "American",
    "Southwest",
    "Alaska",
    "JetBlue",
    "Spirit",
    "Frontier",
    "Hawaiian",
    "SkyWest",
]

AIRPORTS = [
    "ATL",
    "ORD",
    "LAX",
    "JFK",
    "DFW",
    "DEN",
    "SFO",
    "SEA",
    "LAS",
    "MIA",
    "BOS",
    "PHX",
    "EWR",
    "CLT",
    "IAH",
    "MSP",
    "DTW",
    "PHL",
    "RDU",
    "SAN",
]

AIRPORT_COORDS = {
    "ATL": (33.6407, -84.4277),
    "ORD": (41.9742, -87.9073),
    "LAX": (33.9416, -118.4085),
    "JFK": (40.6413, -73.7781),
    "DFW": (32.8998, -97.0403),
    "DEN": (39.8561, -104.6737),
    "SFO": (37.6213, -122.3790),
    "SEA": (47.4502, -122.3088),
    "LAS": (36.0840, -115.1537),
    "MIA": (25.7959, -80.2871),
    "BOS": (42.3656, -71.0096),
    "PHX": (33.4342, -112.0116),
    "EWR": (40.6895, -74.1745),
    "CLT": (35.2140, -80.9431),
    "IAH": (29.9902, -95.3368),
    "MSP": (44.8848, -93.2223),
    "DTW": (42.2162, -83.3554),
    "PHL": (39.8744, -75.2424),
    "RDU": (35.8801, -78.7880),
    "SAN": (32.7338, -117.1933),
}

AIRLINE_DELAY_BASES = {
    "United": 31.0,
    "Delta": 24.0,
    "American": 33.0,
    "Southwest": 27.0,
    "Alaska": 18.0,
    "JetBlue": 29.0,
    "Spirit": 38.0,
    "Frontier": 35.0,
    "Hawaiian": 16.0,
    "SkyWest": 28.0,
}

AIRLINE_FLEET_AGE_BASES = {
    "United": 12.0,
    "Delta": 15.0,
    "American": 13.0,
    "Southwest": 11.0,
    "Alaska": 10.0,
    "JetBlue": 9.0,
    "Spirit": 8.0,
    "Frontier": 7.0,
    "Hawaiian": 14.0,
    "SkyWest": 16.0,
}

AIRPORT_CONGESTION_BASES = {
    "ATL": 0.58,
    "ORD": 0.7,
    "LAX": 0.66,
    "JFK": 0.74,
    "DFW": 0.61,
    "DEN": 0.6,
    "SFO": 0.68,
    "SEA": 0.48,
    "LAS": 0.46,
    "MIA": 0.53,
    "BOS": 0.57,
    "PHX": 0.44,
    "EWR": 0.76,
    "CLT": 0.47,
    "IAH": 0.5,
    "MSP": 0.4,
    "DTW": 0.39,
    "PHL": 0.55,
    "RDU": 0.33,
    "SAN": 0.35,
}


@dataclass(frozen=True)
class GeneratedData:
    dataframe: pd.DataFrame
    airports: list[str]
    airlines: list[str]


def generate_dataset(rows: int = 10_000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    start_date = datetime(2026, 1, 1)

    origin = rng.choice(AIRPORTS, size=rows)
    destination = rng.choice(AIRPORTS, size=rows)
    same_airport = origin == destination
    while np.any(same_airport):
        destination[same_airport] = rng.choice(AIRPORTS, size=int(np.sum(same_airport)))
        same_airport = origin == destination

    airline = rng.choice(AIRLINES, size=rows, p=[0.17, 0.15, 0.15, 0.13, 0.07, 0.07, 0.07, 0.05, 0.03, 0.11])
    departure_hour = rng.integers(0, 24, size=rows)
    day_of_week = rng.integers(0, 7, size=rows)
    month = rng.integers(1, 13, size=rows)
    weather_score = rng.beta(2.2, 4.8, size=rows)
    carrier_delay_history = np.array(
        [
            estimate_carrier_delay_history(airline_code, int(hour), int(flight_month), rng)
            for airline_code, hour, flight_month in zip(airline, departure_hour, month)
        ]
    )
    airport_congestion = np.array(
        [
            estimate_airport_congestion(origin_code, destination_code, int(hour), int(flight_month), rng)
            for origin_code, destination_code, hour, flight_month in zip(origin, destination, departure_hour, month)
        ]
    )
    aircraft_age_years = np.array(
        [estimate_aircraft_age(airline_code, rng) for airline_code in airline]
    )

    scheduled_departure = [
        (start_date + timedelta(days=int(idx % 365), hours=int(hour), minutes=int(rng.choice([0, 10, 20, 30, 40, 50]))))
        for idx, hour in enumerate(departure_hour)
    ]
    distance_miles = np.array(
        [ROUTE_DISTANCE_MILES[f"{origin_code}-{destination_code}"] for origin_code, destination_code in zip(origin, destination)]
    ).round().clip(100, 3000)

    score = (
        -3.0
        + weather_score * 2.5
        + airport_congestion * 1.9
        + (carrier_delay_history / 60) * 1.4
        + (aircraft_age_years / 25) * 0.45
        + (distance_miles / 3000) * 0.32
        + np.isin(departure_hour, [6, 7, 8, 16, 17, 18, 19, 20]) * 0.38
        + np.isin(month, [6, 7, 11, 12]) * 0.18
        + np.isin(day_of_week, [0, 4, 6]) * 0.11
        + rng.normal(0, 0.18, size=rows)
    )

    delay_probability = 1 / (1 + np.exp(-score))
    delay_signal = delay_probability + rng.normal(0, 0.05, size=rows)
    is_delayed = (delay_signal >= 0.58).astype(int)

    delay_minutes = np.where(
        is_delayed == 1,
        np.clip(
            np.round(
                15
                + weather_score * 80
                + airport_congestion * 65
                + carrier_delay_history * 0.9
                + (distance_miles / 60)
                + rng.normal(0, 18, size=rows)
            ),
            15,
            240,
        ),
        0,
    ).astype(int)

    cancelled_probability = np.clip(weather_score * 0.18 + airport_congestion * 0.08 - 0.02, 0, 0.18)
    is_cancelled = rng.binomial(1, cancelled_probability)
    delay_minutes = np.where(is_cancelled == 1, 0, delay_minutes)
    is_delayed = np.where(is_cancelled == 1, 0, is_delayed)

    flight_ids = [f"SKY{1000 + i}" for i in range(rows)]
    risk_level = pd.cut(
        delay_probability,
        bins=[-0.01, 0.4, 0.7, 1.01],
        labels=["Low", "Medium", "High"],
    ).astype(str)
    status = np.where(is_cancelled == 1, "Cancelled", np.where(is_delayed == 1, "Delayed", "On Time"))

    dataframe = pd.DataFrame(
        {
            "flight_id": flight_ids,
            "airline": airline,
            "origin": origin,
            "destination": destination,
            "scheduled_departure": scheduled_departure,
            "day_of_week": day_of_week,
            "month": month,
            "departure_hour": departure_hour,
            "carrier_delay_history": carrier_delay_history.round(2),
            "weather_score": weather_score.round(3),
            "airport_congestion": airport_congestion.round(3),
            "aircraft_age_years": aircraft_age_years,
            "distance_miles": distance_miles.astype(int),
            "delay_probability": delay_probability.round(4),
            "is_delayed": is_delayed.astype(int),
            "delay_minutes": delay_minutes.astype(int),
            "risk_level": risk_level,
            "status": status,
        }
    )

    return dataframe


def estimate_carrier_delay_history(
    airline: str,
    departure_hour: int,
    month: int,
    rng: np.random.Generator | None = None,
) -> float:
    random = rng if rng is not None else np.random.default_rng()
    peak_hour_penalty = 7.5 if departure_hour in {6, 7, 8, 16, 17, 18, 19, 20} else 0.0
    seasonal_penalty = 4.5 if month in {6, 7, 11, 12} else 0.0
    value = AIRLINE_DELAY_BASES[airline] + peak_hour_penalty + seasonal_penalty + float(random.normal(0, 4.2))
    return float(np.clip(round(value, 2), 4, 60))


def estimate_airport_congestion(
    origin: str,
    destination: str,
    departure_hour: int,
    month: int,
    rng: np.random.Generator | None = None,
) -> float:
    random = rng if rng is not None else np.random.default_rng()
    base = (AIRPORT_CONGESTION_BASES[origin] * 0.65) + (AIRPORT_CONGESTION_BASES[destination] * 0.35)
    peak_penalty = 0.12 if departure_hour in {6, 7, 8, 16, 17, 18, 19, 20} else -0.04
    seasonal_penalty = 0.06 if month in {6, 7, 11, 12} else 0.0
    value = base + peak_penalty + seasonal_penalty + float(random.normal(0, 0.05))
    return float(np.clip(round(value, 3), 0.08, 0.98))


def estimate_aircraft_age(airline: str, rng: np.random.Generator | None = None) -> int:
    random = rng if rng is not None else np.random.default_rng()
    value = AIRLINE_FLEET_AGE_BASES[airline] + float(random.normal(0, 2.8))
    return int(np.clip(round(value), 1, 25))


def _haversine_miles(origin: str, destination: str) -> float:
    lat1, lon1 = AIRPORT_COORDS[origin]
    lat2, lon2 = AIRPORT_COORDS[destination]
    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)

    a = np.sin(delta_phi / 2) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return float(3958.8 * c)


ROUTE_DISTANCE_MILES = {
    f"{origin}-{destination}": int(round(_haversine_miles(origin, destination)))
    for origin in AIRPORTS
    for destination in AIRPORTS
    if origin != destination
}
