import React from "react";

const COLORS = { healthy: "#2DD9C4", degraded: "#F5B942", outage: "#F0475F" };

export default function HealthScoreGauge({ score = 0, status = "healthy" }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = COLORS[status] || COLORS.healthy;

  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold">{score}</span>
        <span className="text-xs text-ink-muted">/ 100</span>
      </div>
    </div>
  );
}
