import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sky: {
          bg: "var(--sky-bg)",
          surface: "var(--sky-surface)",
          border: "var(--sky-border)",
          accent: "var(--sky-accent)",
          accent2: "var(--sky-accent2)",
          warning: "var(--sky-warning)",
          danger: "var(--sky-danger)",
          success: "var(--sky-success)",
          muted: "var(--sky-muted)",
          text: "var(--sky-text)",
          dim: "var(--sky-text-dim)",
        },
      },
      fontFamily: {
        heading: ["Syne", "sans-serif"],
        mono: ["Space Mono", "monospace"],
        body: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        panel:
          "0 0 0 1px rgba(0,212,255,0.05), 0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
