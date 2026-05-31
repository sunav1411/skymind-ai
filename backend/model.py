from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

FEATURES = [
    "day_of_week",
    "month",
    "departure_hour",
    "carrier_delay_history",
    "weather_score",
    "airport_congestion",
    "aircraft_age_years",
    "distance_miles",
]


@dataclass
class ModelArtifacts:
    model: GradientBoostingClassifier
    accuracy: float
    feature_importances: dict[str, float]
    threshold: float


def train_model(dataframe: pd.DataFrame) -> ModelArtifacts:
    X = dataframe[FEATURES]
    y = dataframe["is_delayed"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = GradientBoostingClassifier(
        n_estimators=180,
        learning_rate=0.08,
        max_depth=3,
        random_state=42,
    )
    model.fit(X_train, y_train)

    probabilities = model.predict_proba(X_test)[:, 1]
    threshold = _best_threshold(y_test.to_numpy(), probabilities)
    predictions = (probabilities >= threshold).astype(int)
    accuracy = accuracy_score(y_test, predictions)

    return ModelArtifacts(
        model=model,
        accuracy=float(round(accuracy, 4)),
        feature_importances={
            feature: float(importance)
            for feature, importance in zip(FEATURES, model.feature_importances_)
        },
        threshold=threshold,
    )


def predict(artifacts: ModelArtifacts, features: dict[str, Any]) -> dict[str, Any]:
    frame = pd.DataFrame([{feature: features[feature] for feature in FEATURES}])
    probability = float(artifacts.model.predict_proba(frame)[0, 1])
    delayed = probability >= artifacts.threshold
    risk_level = _risk_level(probability)
    delay_minutes = _estimate_delay_minutes(features, probability, delayed)
    confidence = float(round(max(probability, 1 - probability), 4))

    weighted: list[tuple[str, float]] = []
    for feature, importance in artifacts.feature_importances.items():
        weighted.append((feature, importance * _normalized_feature_value(feature, features[feature])))

    ranked_factors = sorted(weighted, key=lambda item: item[1], reverse=True)[:3]
    contribution_total = sum(weight for _, weight in ranked_factors) or 1.0
    factor_breakdown = [
        {
            "factor": feature,
            "share": round((weight / contribution_total) * 100, 1),
        }
        for feature, weight in ranked_factors
    ]
    top_factors = [item["factor"] for item in factor_breakdown]

    return {
        "delayed": bool(delayed),
        "probability": round(probability, 4),
        "risk_level": risk_level,
        "estimated_delay_minutes": delay_minutes,
        "confidence": confidence,
        "top_factors": top_factors,
        "factor_breakdown": factor_breakdown,
        "explanation": _build_explanation(factor_breakdown, risk_level, delayed),
    }


def _risk_level(probability: float) -> str:
    if probability >= 0.7:
        return "High"
    if probability >= 0.4:
        return "Medium"
    return "Low"


def _estimate_delay_minutes(features: dict[str, Any], probability: float, delayed: bool) -> int:
    if not delayed:
        return 0

    estimate = (
        15
        + float(features["weather_score"]) * 80
        + float(features["airport_congestion"]) * 55
        + float(features["carrier_delay_history"]) * 0.7
        + (float(features["distance_miles"]) / 75)
        + probability * 30
    )
    return int(np.clip(round(estimate), 15, 240))


def _normalized_feature_value(feature: str, value: Any) -> float:
    numeric = float(value)
    ranges = {
        "day_of_week": 6,
        "month": 12,
        "departure_hour": 23,
        "carrier_delay_history": 60,
        "weather_score": 1,
        "airport_congestion": 1,
        "aircraft_age_years": 25,
        "distance_miles": 3000,
    }
    return numeric / ranges[feature]


def _best_threshold(y_true: np.ndarray, probabilities: np.ndarray) -> float:
    best_threshold = 0.5
    best_score = -1.0
    for threshold in np.arange(0.35, 0.71, 0.025):
        predictions = (probabilities >= threshold).astype(int)
        score = float(((predictions == 1) & (y_true == 1)).sum()) / max((predictions == 1).sum(), 1)
        score += float(((predictions == 1) & (y_true == 1)).sum()) / max((y_true == 1).sum(), 1)
        if score > best_score:
            best_score = score
            best_threshold = float(threshold)
    return best_threshold


def _build_explanation(
    factor_breakdown: list[dict[str, float | str]],
    risk_level: str,
    delayed: bool,
) -> str:
    labels = {
        "weather_score": "adverse weather",
        "airport_congestion": "airport congestion",
        "departure_hour": "peak departure timing",
        "carrier_delay_history": "carrier delay history",
        "distance_miles": "route length",
        "month": "seasonal demand",
        "day_of_week": "weekday traffic patterns",
        "aircraft_age_years": "aircraft fleet age",
    }
    top_labels = [labels.get(str(item["factor"]), str(item["factor"]).replace("_", " ")) for item in factor_breakdown]
    if len(top_labels) >= 2:
        drivers = f"{top_labels[0]} and {top_labels[1]}"
    elif top_labels:
        drivers = top_labels[0]
    else:
        drivers = "network conditions"

    if delayed:
        return f"Expected delay risk is mainly driven by {drivers}, which pushes this flight into the {risk_level.lower()}-risk band."
    return f"The model sees stable operating conditions overall, with {drivers} remaining within a manageable range."
