export interface SummaryResponse {
  total_flights: number;
  delayed_flights: number;
  on_time_rate: number;
  avg_delay_minutes: number;
  worst_airport: string;
  most_delayed_airline: string;
  peak_delay_hour: number;
  high_risk_flights_today: number;
}

export interface AirlineAnalytics {
  airline: string;
  total: number;
  delayed: number;
  on_time_rate: number;
  avg_delay: number;
}

export interface HourAnalytics {
  hour: number;
  delayed_count: number;
  total: number;
  delay_rate: number;
}

export interface AirportAnalytics {
  airport: string;
  delayed_count: number;
  total: number;
  delay_rate: number;
}

export interface MonthlyAnalytics {
  month: number;
  delay_rate: number;
  avg_delay: number;
}

export interface DayAnalytics {
  day_of_week: number;
  delay_rate: number;
  avg_delay: number;
}

export interface PredictionRequest {
  airline: string;
  origin: string;
  destination: string;
  departure_hour: number;
  day_of_week: number;
  month: number;
  weather_score: number;
  airport_congestion: number;
  aircraft_age_years: number;
  distance_miles: number;
}

export interface PredictionResponse {
  delayed: boolean;
  probability: number;
  risk_level: "Low" | "Medium" | "High";
  estimated_delay_minutes: number;
  confidence: number;
  top_factors: string[];
  factor_breakdown: Array<{
    factor: string;
    share: number;
  }>;
  explanation: string;
}

export interface FlightRecord {
  flight_id: string;
  airline: string;
  origin: string;
  destination: string;
  scheduled_departure: string;
  status: "On Time" | "Delayed" | "Cancelled";
  delay_minutes: number;
  risk_level: "Low" | "Medium" | "High";
}

export interface FlightsResponse {
  page: number;
  per_page: number;
  total: number;
  items: FlightRecord[];
}

export interface FlightOptions {
  airlines: string[];
  airports: string[];
  route_distance_miles: Record<string, number>;
}
