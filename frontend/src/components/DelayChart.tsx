import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AirlineAnalytics, HourAnalytics } from "../types";

interface DelayChartProps {
  title: string;
  subtitle: string;
  kind: "hour" | "airline";
  data: HourAnalytics[] | AirlineAnalytics[];
}

export function DelayChart({
  title,
  subtitle,
  kind,
  data,
}: DelayChartProps) {
  const safeData =
    kind === "hour"
      ? (data as HourAnalytics[]).map((item) => ({
          ...item,
          hour: item.hour ?? 0,
          delay_rate: Number.isFinite(Number(item.delay_rate))
            ? Number(item.delay_rate)
            : 0,
        }))
      : (data as AirlineAnalytics[]).map((item) => ({
          ...item,
          airline: item.airline ?? "Unknown",
          on_time_rate: Number.isFinite(Number(item.on_time_rate))
            ? Number(item.on_time_rate)
            : 0,
        }));

  return (
    <div className="sky-panel p-6">
      <div className="mb-5">
        <p className="font-heading text-2xl font-bold text-white">
          {title}
        </p>
        <p className="mt-1 text-sm text-[var(--sky-text-dim)]">
          {subtitle}
        </p>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "hour" ? (
            <AreaChart data={safeData as HourAnalytics[]}>
              <defs>
                <linearGradient
                  id="delayGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(0,212,255,0.06)"
                vertical={false}
              />

              <XAxis dataKey="hour" stroke="#718096" />
              <YAxis stroke="#718096" />

              <Tooltip
                contentStyle={{
                  background: "#0d1420",
                  border: "1px solid #1a2535",
                  borderRadius: 18,
                }}
              />

              <Area
                type="monotone"
                dataKey="delay_rate"
                stroke="#00d4ff"
                strokeWidth={3}
                fill="url(#delayGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart
              data={[...(safeData as AirlineAnalytics[])].sort(
                (a, b) => a.on_time_rate - b.on_time_rate,
              )}
              layout="vertical"
              margin={{ top: 6, right: 8, bottom: 6, left: 8 }}
            >
              <CartesianGrid
                stroke="rgba(0,212,255,0.06)"
                horizontal={false}
              />

              <XAxis
                type="number"
                stroke="#718096"
                domain={[0.5, 1]}
                tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`}
              />

              <YAxis
                type="category"
                dataKey="airline"
                stroke="#718096"
                width={90}
              />

              <Tooltip
                formatter={(value: number) => [`${Math.round(value * 100)}%`, "On-time rate"]}
                contentStyle={{
                  background: "#0d1420",
                  border: "1px solid #1a2535",
                  borderRadius: 18,
                }}
              />

              <Bar
                dataKey="on_time_rate"
                fill="#00d4ff"
                radius={[0, 12, 12, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
