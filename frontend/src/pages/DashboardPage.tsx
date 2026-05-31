import { useEffect, useState } from "react";
import { AlertTriangle, Clock3, Plane, Radar, TrendingUp } from "lucide-react";
import { api } from "../api/client";
import { AirportHeatmap } from "../components/AirportHeatmap";
import { DelayChart } from "../components/DelayChart";
import { StatCard } from "../components/StatCard";
import type { AirlineAnalytics, AirportAnalytics, HourAnalytics, SummaryResponse } from "../types";

export function DashboardPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [airline, setAirline] = useState<AirlineAnalytics[]>([]);
  const [hour, setHour] = useState<HourAnalytics[]>([]);
  const [airport, setAirport] = useState<AirportAnalytics[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.summary(), api.byAirline(), api.byHour(), api.byAirport()])
      .then(([summaryData, airlineData, hourData, airportData]) => {
        setSummary(summaryData);
        setAirline(airlineData);
        setHour(hourData);
        setAirport(airportData);
      })
      .catch(() => setError("Unable to load SkyMind dashboard data right now."));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10 pt-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="sky-subtitle">Flight Operations Overview</p>
          <h1 className="mt-3 font-heading text-5xl font-extrabold text-white">SkyMind AI</h1>
          <p className="mt-3 max-w-2xl text-lg text-[var(--sky-text-dim)]">
            Predict smarter. Fly better. Mission-control visibility for airline delay risk and network performance.
          </p>
        </div>
      </div>

      {error && <ErrorCard message={error} />}

      {!summary ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="sky-panel h-40 animate-pulse bg-[rgba(255,255,255,0.03)]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Flights"
            value={summary.total_flights.toLocaleString()}
            detail="Synthetic airline network generated at startup"
            icon={<Plane className="h-5 w-5" />}
          />
          <StatCard
            label="On-Time Rate"
            value={`${Math.round(summary.on_time_rate * 100)}%`}
            detail="Flights predicted on schedule"
            icon={<TrendingUp className="h-5 w-5" />}
            accent={summary.on_time_rate > 0.7 ? "green" : "orange"}
          />
          <StatCard
            label="Avg Delay"
            value={`${summary.avg_delay_minutes} min`}
            detail={`Peak delay hour: ${summary.peak_delay_hour}:00`}
            icon={<Clock3 className="h-5 w-5" />}
            accent="orange"
          />
          <StatCard
            label="High Risk Flights Today"
            value={summary.high_risk_flights_today.toLocaleString()}
            detail={`Most delayed airline: ${summary.most_delayed_airline}`}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent="red"
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DelayChart
          title="Delay Trend by Hour"
          subtitle="Delay rate across the departure schedule."
          kind="hour"
          data={hour}
        />
        <DelayChart
          title="Airline Performance"
          subtitle="On-time rate ranked by carrier."
          kind="airline"
          data={airline}
        />
      </div>

      <div className="mt-8">
        <AirportHeatmap data={airport} />
      </div>

      {summary && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <InsightCard title="Worst Airport" value={summary.worst_airport} detail="Most disruption-prone origin in the network." />
          <InsightCard title="Delayed Flights" value={summary.delayed_flights.toLocaleString()} detail="Flights currently classified as delayed." />
          <InsightCard title="Radar" value="Model Live" detail="Synthetic data + trained delay classifier active." />
        </div>
      )}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-2xl border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.08)] px-4 py-3 text-sm text-[var(--sky-danger)]">
      {message}
    </div>
  );
}

function InsightCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="sky-panel p-5">
      <div className="sky-subtitle">{title}</div>
      <div className="mt-4 font-heading text-3xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm text-[var(--sky-text-dim)]">{detail}</div>
    </div>
  );
}
