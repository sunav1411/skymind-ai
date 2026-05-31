import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client";
import { StatCard } from "../components/StatCard";
import type { AirlineAnalytics, AirportAnalytics, DayAnalytics, MonthlyAnalytics, SummaryResponse } from "../types";
import { Activity, AlertTriangle, Clock3, PlaneTakeoff } from "lucide-react";

const weekdayMap = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [monthly, setMonthly] = useState<MonthlyAnalytics[]>([]);
  const [daily, setDaily] = useState<DayAnalytics[]>([]);
  const [airports, setAirports] = useState<AirportAnalytics[]>([]);
  const [airlines, setAirlines] = useState<AirlineAnalytics[]>([]);
  const industryAverage =
    airlines.length > 0 ? Number((airlines.reduce((sum, item) => sum + item.on_time_rate, 0) / airlines.length).toFixed(3)) : 0;

  useEffect(() => {
    Promise.all([api.summary(), api.monthly(), api.byDay(), api.byAirport(), api.byAirline()]).then(
      ([summaryData, monthlyData, dailyData, airportData, airlineData]) => {
        setSummary(summaryData);
        setMonthly(monthlyData);
        setDaily(dailyData);
        setAirports(airportData);
        setAirlines(airlineData);
      },
    );
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10 pt-24">
      <div className="mb-8">
        <p className="sky-subtitle">Network Analytics</p>
        <h1 className="mt-3 font-heading text-5xl font-extrabold text-white">Flight Intelligence Dashboard</h1>
      </div>

      {summary ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Flights" value={summary.total_flights.toLocaleString()} detail="Operational network size" icon={<PlaneTakeoff className="h-5 w-5" />} />
          <StatCard label="Delayed Flights" value={summary.delayed_flights.toLocaleString()} detail="Flights currently marked delayed" icon={<AlertTriangle className="h-5 w-5" />} accent="red" />
          <StatCard label="On-Time Rate" value={`${Math.round(summary.on_time_rate * 100)}%`} detail="Systemwide punctuality signal" icon={<Activity className="h-5 w-5" />} accent="green" />
          <StatCard label="Avg Delay" value={`${summary.avg_delay_minutes} min`} detail="Average delay for delayed flights" icon={<Clock3 className="h-5 w-5" />} accent="orange" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="sky-panel h-40 animate-pulse bg-[rgba(255,255,255,0.03)]" />
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ChartPanel title="Monthly Delay Trend" subtitle="Delay rate and average delay minutes across the year.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid stroke="rgba(0,212,255,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="#718096" />
              <YAxis yAxisId="left" stroke="#718096" />
              <YAxis yAxisId="right" orientation="right" stroke="#718096" />
              <Tooltip contentStyle={{ background: "#0d1420", border: "1px solid #1a2535", borderRadius: 18 }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="delay_rate" stroke="#00d4ff" strokeWidth={3} />
              <Line yAxisId="right" type="monotone" dataKey="avg_delay" stroke="#ff6b35" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Delay by Day of Week" subtitle="Weekly operational pattern across the schedule.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily.map((entry) => ({ ...entry, label: weekdayMap[entry.day_of_week] }))}>
              <CartesianGrid stroke="rgba(0,212,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#718096" />
              <YAxis stroke="#718096" />
              <Tooltip contentStyle={{ background: "#0d1420", border: "1px solid #1a2535", borderRadius: 18 }} />
              <Bar dataKey="delay_rate" fill="#00d4ff" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="sky-panel p-6">
          <div className="mb-5">
            <p className="font-heading text-2xl font-bold text-white">Airport Risk Matrix</p>
            <p className="mt-1 text-sm text-[var(--sky-text-dim)]">Origin airports ranked by delay rate.</p>
          </div>
          <div className="space-y-3">
            {airports.slice(0, 10).map((airport) => (
              <div key={airport.airport} className="grid grid-cols-[80px_1fr_90px] items-center gap-4 rounded-2xl border border-[var(--sky-border)] bg-black/10 px-4 py-3">
                <div className="font-heading text-xl font-bold text-white">{airport.airport}</div>
                <div>
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[var(--sky-warning)] to-[var(--sky-danger)]"
                      style={{ width: `${Math.round(airport.delay_rate * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-[var(--sky-text-dim)]">{airport.total} flights</div>
                </div>
                <div className="font-mono text-right text-sm text-[var(--sky-text)]">{Math.round(airport.delay_rate * 100)}%</div>
              </div>
            ))}
          </div>
        </div>

        <ChartPanel title="Airline Comparison" subtitle="On-time rate versus network competition.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={airlines.map((entry) => ({ ...entry, industry_avg: industryAverage }))}>
              <CartesianGrid stroke="rgba(0,212,255,0.06)" vertical={false} />
              <XAxis dataKey="airline" stroke="#718096" angle={-18} textAnchor="end" height={80} />
              <YAxis stroke="#718096" />
              <Tooltip contentStyle={{ background: "#0d1420", border: "1px solid #1a2535", borderRadius: 18 }} />
              <Legend />
              <Bar dataKey="on_time_rate" name="on_time_rate" fill="#00d4ff" radius={[12, 12, 0, 0]} />
              <Bar dataKey="industry_avg" name="industry_avg" fill="#4a5568" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="sky-panel p-6">
      <div className="mb-5">
        <p className="font-heading text-2xl font-bold text-white">{title}</p>
        <p className="mt-1 text-sm text-[var(--sky-text-dim)]">{subtitle}</p>
      </div>
      <div className="h-[320px]">{children}</div>
    </div>
  );
}
