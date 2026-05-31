import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../api/client";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/predict", label: "Predict" },
  { to: "/analytics", label: "Analytics" },
  { to: "/flights", label: "Flights" },
];

export function Navbar() {
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    api.health()
      .then((data) => setAccuracy(data.model_accuracy))
      .catch(() => setAccuracy(null));
  }, []);

  return (
    <header className="fixed left-0 top-0 z-50 h-14 w-full border-b border-[rgba(0,212,255,0.1)] bg-[#080c14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.08)] p-2 text-[var(--sky-accent)]">
            <Plane className="h-4 w-4" />
          </div>
          <div className="font-heading text-xl font-extrabold uppercase tracking-[0.2em] text-white">
            SKY<span className="text-[var(--sky-accent)]">MIND</span>
          </div>
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="group relative font-medium text-[var(--sky-text-dim)]">
              {({ isActive }) => (
                <>
                  <span
                    className={
                      isActive
                        ? "text-[var(--sky-accent)] [text-shadow:0_0_18px_rgba(0,212,255,0.45)]"
                        : "transition group-hover:text-white"
                    }
                  >
                    {link.label}
                  </span>
                  <motion.span
                    layoutId="nav-line"
                    className={isActive ? "absolute -bottom-[18px] left-0 h-0.5 w-full bg-[var(--sky-accent)]" : "hidden"}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 rounded-full border border-[rgba(0,230,118,0.18)] bg-[rgba(0,230,118,0.08)] px-4 py-1.5 font-mono text-xs uppercase tracking-[0.24em] text-[var(--sky-success)] lg:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--sky-success)]" />
          MODEL ACTIVE - {accuracy !== null ? `${Math.round(accuracy * 100)}% ACC` : "SYNCING"}
        </div>
      </div>
    </header>
  );
}
