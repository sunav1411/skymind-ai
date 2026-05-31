import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../api/client";
import { FlightTable } from "../components/FlightTable";
import type { FlightOptions, FlightsResponse } from "../types";

export function FlightsPage() {
  const [options, setOptions] = useState<FlightOptions | null>(null);
  const [data, setData] = useState<FlightsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [airline, setAirline] = useState("");
  const [status, setStatus] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    api.options().then(setOptions);
  }, []);

  useEffect(() => {
    api
      .flights({
        page,
        per_page: 20,
        search,
        airline,
        origin,
        status,
      })
      .then(setData);
  }, [page, search, airline, origin, status]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10 pt-24">
      <div className="mb-8">
        <p className="sky-subtitle">Flight Explorer</p>
        <h1 className="mt-3 font-heading text-5xl font-extrabold text-white">Live Flight Manifest</h1>
      </div>

      <div className="sky-panel p-5">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="rounded-2xl border border-[var(--sky-border)] bg-black/10 px-4 py-3">
            <div className="mb-2 text-xs uppercase tracking-[0.24em] text-[var(--sky-text-dim)]">Search</div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--sky-text-dim)]" />
              <input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                className="w-full bg-transparent text-white outline-none"
                placeholder="Flight ID, airline, airport..."
              />
            </div>
          </label>
          <SelectFilter label="Airline" value={airline} onChange={(value) => { setPage(1); setAirline(value); }} options={options?.airlines ?? []} />
          <SelectFilter label="Status" value={status} onChange={(value) => { setPage(1); setStatus(value); }} options={["On Time", "Delayed", "Cancelled"]} />
          <SelectFilter label="Origin" value={origin} onChange={(value) => { setPage(1); setOrigin(value); }} options={options?.airports ?? []} />
        </div>

        <div className="mt-6">
          {data ? <FlightTable rows={data.items} /> : <div className="h-80 animate-pulse rounded-3xl bg-[rgba(255,255,255,0.03)]" />}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-2xl border border-[var(--sky-border)] px-4 py-2 font-mono text-sm text-[var(--sky-text-dim)]"
          >
            Prev
          </button>
          <div className="font-mono text-sm text-[var(--sky-text-dim)]">
            Page {page} of {totalPages}
          </div>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-2xl border border-[var(--sky-border)] px-4 py-2 font-mono text-sm text-[var(--sky-text-dim)]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="rounded-2xl border border-[var(--sky-border)] bg-black/10 px-4 py-3">
      <div className="mb-2 text-xs uppercase tracking-[0.24em] text-[var(--sky-text-dim)]">{label}</div>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-white outline-none">
        <option value="">All</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
