import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  accent?: "cyan" | "green" | "orange" | "red";
}

const accentClass = {
  cyan: "text-[var(--sky-accent)]",
  green: "text-[var(--sky-success)]",
  orange: "text-[var(--sky-warning)]",
  red: "text-[var(--sky-danger)]",
};

export function StatCard({ label, value, detail, icon, accent = "cyan" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="sky-panel p-5"
    >
      <div className="flex items-center justify-between">
        <div className="sky-subtitle">{label}</div>
        <div className={`rounded-2xl bg-black/20 p-3 ${accentClass[accent]}`}>{icon}</div>
      </div>
      <div className={`mt-5 font-mono text-4xl font-bold ${accentClass[accent]} sky-text-glow`}>{value}</div>
      <div className="mt-2 text-sm text-[var(--sky-text-dim)]">{detail}</div>
    </motion.div>
  );
}
