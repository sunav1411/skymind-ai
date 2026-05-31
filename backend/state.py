from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from model import ModelArtifacts


@dataclass
class AppState:
    flights: pd.DataFrame | None = None
    model: ModelArtifacts | None = None


app_state = AppState()
