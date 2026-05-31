import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PredictionForm } from "../components/PredictionForm";
import { RiskBadge } from "../components/RiskBadge";
import type { FlightOptions, PredictionRequest, PredictionResponse } from "../types";

const initialRequest: PredictionRequest = {
  airline: "United",
  origin: "ORD",
  destination: "JFK",
  departure_hour: 17,
  day_of_week: 3,
  month: 6,
  weather_score: 0.58,
  airport_congestion: 0.66,
  aircraft_age_years: 11,
  distance_miles: 740,
};

export function PredictPage() {
  const [options, setOptions] = useState<FlightOptions | null>(null);
  const [form, setForm] = useState<PredictionRequest>(initialRequest);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.options()
      .then((data) => {
        setOptions(data);
        const routeKey = `${initialRequest.origin}-${initialRequest.destination}`;
        setForm((current) => ({ ...current, distance_miles: data.route_distance_miles[routeKey] ?? current.distance_miles }));
      })
      .catch(() => setError("Unable to load flight network options."));
  }, []);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.predict(form);
      setResult(response);
    } catch {
      setError("Prediction request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10 pt-24">
      <div className="mb-8">
        <p className="sky-subtitle">Delay Prediction Console</p>
        <h1 className="mt-3 font-heading text-5xl font-extrabold text-white">Analyze Flight Risk</h1>
      </div>

      {error && <div className="mb-6 rounded-2xl border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.08)] px-4 py-3 text-sm text-[var(--sky-danger)]">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        {options ? (
          <PredictionForm value={form} options={options} onChange={setForm} onSubmit={analyze} loading={loading} />
        ) : (
          <div className="sky-panel h-[680px] animate-pulse bg-[rgba(255,255,255,0.03)]" />
        )}

        <div className="sky-panel flex min-h-[680px] flex-col p-6">
          <div>
            <p className="sky-subtitle">Prediction Result</p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white">Delay Probability Engine</h2>
          </div>

          {!result ? (
            <div className="mt-6 flex flex-1 items-center justify-center rounded-3xl border border-dashed border-[rgba(0,212,255,0.12)] bg-[rgba(255,255,255,0.01)] p-6 text-center text-[var(--sky-text-dim)]">
              Enter flight details to analyze.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex flex-1 flex-col"
            >
              <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--sky-border)] bg-black/10 px-6 py-8">
                <ProbabilityGauge probability={result.probability} />
                <div className="mt-5">
                  <RiskBadge level={result.risk_level} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Metric label="Estimated Delay" value={`${result.estimated_delay_minutes} min`} />
                <Metric label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
              </div>

              <div className="mt-6 rounded-3xl border border-[var(--sky-border)] bg-black/10 p-5">
                <div className="font-heading text-xl font-bold text-white">Top Contributing Factors</div>
                <div className="mt-4 space-y-4">
                  {result.factor_breakdown.map((item) => (
                    <div key={item.factor}>
                      <div className="mb-2 flex items-center justify-between font-mono text-sm uppercase text-[var(--sky-text-dim)]">
                        <span>{formatFactor(item.factor)}</span>
                        <span>{item.share}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)]">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[var(--sky-accent)] to-[var(--sky-accent2)]"
                          style={{ width: `${item.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-[var(--sky-border)] bg-black/10 p-5">
                <div className="font-heading text-xl font-bold text-white">AI Explanation</div>
                <p className="mt-3 text-[var(--sky-text-dim)]">{result.explanation}</p>
              </div>

              <div className="mt-6 rounded-3xl border border-[var(--sky-border)] bg-black/10 p-5">
                <div className="font-heading text-xl font-bold text-white">Recommendation</div>
                <p className="mt-3 text-[var(--sky-text-dim)]">
                  {result.risk_level === "High"
                    ? "Consider rebooking or adding significant buffer time before departure."
                    : result.risk_level === "Medium"
                      ? "Monitor flight status closely and expect moderate disruption risk."
                      : "Flight looks good. Current conditions suggest a stable operation."}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProbabilityGauge({ probability }: { probability: number }) {
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - probability * circumference;
  const stroke = probability > 0.7 ? "#ff2d55" : probability > 0.4 ? "#ff6b35" : "#00e676";

  return (
    <div className="relative h-[240px] w-[240px]">
      <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
        <circle cx="120" cy="120" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-5xl font-bold text-white sky-text-glow">{Math.round(probability * 100)}%</div>
        <div className="mt-2 text-sm uppercase tracking-[0.24em] text-[var(--sky-text-dim)]">Delay Probability</div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--sky-border)] bg-black/10 p-5">
      <div className="sky-subtitle">{label}</div>
      <div className="mt-3 font-mono text-3xl text-[var(--sky-accent)] sky-text-glow">{value}</div>
    </div>
  );
}

function formatFactor(factor: string) {
  return factor.replace(/_/g, " ");
}
