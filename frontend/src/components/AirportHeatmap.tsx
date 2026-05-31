import type { AirportAnalytics } from "../types";

interface AirportHeatmapProps {
  data: AirportAnalytics[];
}

export function AirportHeatmap({ data }: AirportHeatmapProps) {
  return (
    <div className="sky-panel p-6">
      <div className="mb-5">
        <p className="font-heading text-2xl font-bold text-white">Top Delay Airports</p>
        <p className="mt-1 text-sm text-[var(--sky-text-dim)]">
          Delay-sensitive hubs ranked by modeled delay rate.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.slice(0, 8).map((airport) => {
          const percent = Math.round(airport.delay_rate * 100);
          const bg =
            percent >= 55
              ? "from-[rgba(255,45,85,0.18)] to-transparent"
              : percent >= 35
                ? "from-[rgba(255,107,53,0.16)] to-transparent"
                : "from-[rgba(0,230,118,0.16)] to-transparent";
          const text =
            percent >= 55
              ? "text-[var(--sky-danger)]"
              : percent >= 35
                ? "text-[var(--sky-warning)]"
                : "text-[var(--sky-success)]";

          return (
            <div key={airport.airport} className={`rounded-2xl border border-[var(--sky-border)] bg-gradient-to-br ${bg} p-4`}>
              <div className="font-heading text-2xl font-bold text-white">{airport.airport}</div>
              <div className={`mt-4 font-mono text-3xl ${text}`}>{percent}%</div>
              <div className="mt-2 text-sm text-[var(--sky-text-dim)]">
                {airport.delayed_count} delayed of {airport.total}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
