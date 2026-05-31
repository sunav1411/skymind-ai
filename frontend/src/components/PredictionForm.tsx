import type { ReactNode } from "react";
import { PlaneTakeoff } from "lucide-react";
import type { FlightOptions, PredictionRequest } from "../types";

interface PredictionFormProps {
  value: PredictionRequest;
  options: FlightOptions;
  onChange: (value: PredictionRequest) => void;
  onSubmit: () => void;
  loading: boolean;
}

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function PredictionForm({ value, options, onChange, onSubmit, loading }: PredictionFormProps) {
  function patch(next: Partial<PredictionRequest>) {
    const updated = { ...value, ...next };
    const routeKey = `${updated.origin}-${updated.destination}`;
    updated.distance_miles = options.route_distance_miles[routeKey] ?? updated.distance_miles;
    onChange(updated);
  }

  return (
    <div className="sky-panel p-6">
      <div className="mb-6">
        <p className="sky-subtitle">Flight Inputs</p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-white">Operational Risk Setup</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Airline">
          <select
            value={value.airline}
            onChange={(event) => patch({ airline: event.target.value })}
            className={controlClassName}
          >
            {options.airlines.map((airline) => (
              <option key={airline} value={airline} className="bg-[#0d1420] text-white">
                {airline}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Origin Airport">
          <select
            value={value.origin}
            onChange={(event) => patch({ origin: event.target.value })}
            className={controlClassName}
          >
            {options.airports.map((airport) => (
              <option key={airport} value={airport} className="bg-[#0d1420] text-white">
                {airport}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Destination Airport">
          <select
            value={value.destination}
            onChange={(event) => patch({ destination: event.target.value })}
            className={controlClassName}
          >
            {options.airports.map((airport) => (
              <option key={airport} value={airport} className="bg-[#0d1420] text-white">
                {airport}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Departure Hour - ${formatHour(value.departure_hour)}`}>
          <input
            type="range"
            min={0}
            max={23}
            value={value.departure_hour}
            onChange={(event) => patch({ departure_hour: Number(event.target.value) })}
          />
        </Field>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[var(--sky-text-dim)]">Day of Week</label>
        <div className="grid grid-cols-7 gap-2">
          {weekdayLabels.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => patch({ day_of_week: index })}
              className={
                value.day_of_week === index
                  ? "rounded-2xl border border-[var(--sky-accent)] bg-[rgba(0,212,255,0.12)] py-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--sky-accent)]"
                  : "rounded-2xl border border-[var(--sky-border)] bg-black/10 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--sky-text-dim)]"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-[var(--sky-text-dim)]">Month</label>
        <div className="grid grid-cols-4 gap-2 lg:grid-cols-6">
          {monthLabels.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => patch({ month: index + 1 })}
              className={
                value.month === index + 1
                  ? "rounded-2xl border border-[var(--sky-accent)] bg-[rgba(0,212,255,0.12)] py-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--sky-accent)]"
                  : "rounded-2xl border border-[var(--sky-border)] bg-black/10 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--sky-text-dim)]"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label={`Weather Score - ${value.weather_score.toFixed(2)}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value.weather_score}
            onChange={(event) => patch({ weather_score: Number(event.target.value) })}
          />
        </Field>
        <Field label={`Airport Congestion - ${value.airport_congestion.toFixed(2)}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value.airport_congestion}
            onChange={(event) => patch({ airport_congestion: Number(event.target.value) })}
          />
        </Field>
        <Field label={`Aircraft Age - ${value.aircraft_age_years} years`}>
          <input
            type="range"
            min={1}
            max={25}
            value={value.aircraft_age_years}
            onChange={(event) => patch({ aircraft_age_years: Number(event.target.value) })}
          />
        </Field>
        <Field label="Distance (miles)">
          <input
            type="number"
            min={100}
            max={3000}
            value={value.distance_miles}
            onChange={(event) => patch({ distance_miles: Number(event.target.value) })}
            className={controlClassName}
          />
        </Field>
      </div>

      <button
        type="button"
        aria-label="Analyze flight"
        onClick={onSubmit}
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[var(--sky-accent)] to-[var(--sky-accent2)] px-5 py-4 font-heading text-base font-bold uppercase tracking-[0.2em] text-[#04111d] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <PlaneTakeoff className={`h-5 w-5 ${loading ? "animate-bounce" : ""}`} />
        {loading ? "Analyzing..." : "Analyze Flight"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-[var(--sky-text-dim)]">{label}</span>
      <div className="rounded-2xl border border-[var(--sky-border)] bg-black/10 px-4 py-3 text-white">
        {children}
      </div>
    </label>
  );
}

function formatHour(hour: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:00 ${period}`;
}

const controlClassName =
  "w-full bg-transparent text-white outline-none selection:bg-[rgba(0,212,255,0.3)]";
