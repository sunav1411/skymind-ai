import clsx from "clsx";

interface RiskBadgeProps {
  level: "Low" | "Medium" | "High";
}

export function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-[0.2em]",
        level === "Low" &&
          "border-[rgba(0,230,118,0.2)] bg-[rgba(0,230,118,0.08)] text-[var(--sky-success)]",
        level === "Medium" &&
          "border-[rgba(255,107,53,0.2)] bg-[rgba(255,107,53,0.08)] text-[var(--sky-warning)]",
        level === "High" &&
          "border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.08)] text-[var(--sky-danger)]",
      )}
    >
      <span
        className={clsx(
          "h-2 w-2 rounded-full",
          level === "Low" && "bg-[var(--sky-success)]",
          level === "Medium" && "bg-[var(--sky-warning)]",
          level === "High" && "animate-pulse bg-[var(--sky-danger)]",
        )}
      />
      {level}
    </span>
  );
}
