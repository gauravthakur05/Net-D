/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Design tokens - "vitals monitor" palette
        base: {
          DEFAULT: "#0B1120", // deep navy background (dark mode)
          light: "#F6F8FC", // light mode background
        },
        surface: {
          DEFAULT: "#121B2E", // card background, dark mode
          light: "#FFFFFF",
        },
        border: {
          DEFAULT: "#22304A",
          light: "#E2E8F2",
        },
        vital: {
          healthy: "#2DD9C4", // cyan-teal pulse - "healthy"
          warning: "#F5B942", // amber - "degraded"
          critical: "#F0475F", // coral-red - "outage"
        },
        ink: {
          DEFAULT: "#E8EDF7",
          muted: "#8A97B3",
          light: "#101828",
          "light-muted": "#5B657A",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(45, 217, 196, 0.35)",
      },
      keyframes: {
        pulseLine: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseLine: "pulseLine 3s linear infinite",
        fadeUp: "fadeUp 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
