import type {
  AirlineAnalytics,
  AirportAnalytics,
  DayAnalytics,
  FlightsResponse,
  FlightOptions,
  HourAnalytics,
  MonthlyAnalytics,
  PredictionRequest,
  PredictionResponse,
  SummaryResponse,
} from "../types";

const BASE = import.meta.env.VITE_API_URL || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  predict: (body: PredictionRequest) =>
    request<PredictionResponse>("/api/predict", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  summary: () => request<SummaryResponse>("/api/analytics/summary"),
  byAirline: () => request<AirlineAnalytics[]>("/api/analytics/by-airline"),
  byHour: () => request<HourAnalytics[]>("/api/analytics/by-hour"),
  byAirport: () => request<AirportAnalytics[]>("/api/analytics/by-airport"),
  monthly: () => request<MonthlyAnalytics[]>("/api/analytics/monthly"),
  byDay: () => request<DayAnalytics[]>("/api/analytics/by-day"),
  flights: (params: Record<string, string | number>) =>
    request<FlightsResponse>(
      `/api/flights?${new URLSearchParams(
        Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
      ).toString()}`,
    ),
  options: () => request<FlightOptions>("/api/flights/options"),
  health: () => request<{ status: string; model_accuracy: number }>("/health"),
};
