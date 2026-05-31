import { RiskBadge } from "./RiskBadge";
import type { FlightRecord } from "../types";

interface FlightTableProps {
  rows: FlightRecord[];
}

export function FlightTable({ rows }: FlightTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3 text-left">
        <thead>
          <tr className="sky-subtitle">
            <th>Flight ID</th>
            <th>Airline</th>
            <th>Route</th>
            <th>Scheduled</th>
            <th>Status</th>
            <th>Delay</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.flight_id} className="rounded-2xl bg-[rgba(255,255,255,0.015)] hover:border-l-2 hover:border-[var(--sky-accent)]">
              <td className="rounded-l-2xl px-3 py-3 font-mono text-sm text-white">{row.flight_id}</td>
              <td className="px-3 py-3">{row.airline}</td>
              <td className="px-3 py-3 font-mono text-sm">
                {row.origin} → {row.destination}
              </td>
              <td className="px-3 py-3 text-sm text-[var(--sky-text-dim)]">
                {new Date(row.scheduled_departure).toLocaleString()}
              </td>
              <td className="px-3 py-3">
                <span
                  className={
                    row.status === "On Time"
                      ? "rounded-full border border-[rgba(0,230,118,0.2)] bg-[rgba(0,230,118,0.08)] px-3 py-1 font-mono text-xs uppercase text-[var(--sky-success)]"
                      : row.status === "Delayed"
                        ? "rounded-full border border-[rgba(255,107,53,0.2)] bg-[rgba(255,107,53,0.08)] px-3 py-1 font-mono text-xs uppercase text-[var(--sky-warning)]"
                        : "rounded-full border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.08)] px-3 py-1 font-mono text-xs uppercase text-[var(--sky-danger)]"
                  }
                >
                  {row.status}
                </span>
              </td>
              <td className="px-3 py-3 font-mono text-sm">{row.delay_minutes} min</td>
              <td className="rounded-r-2xl px-3 py-3">
                <RiskBadge level={row.risk_level} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
