import React, { useMemo } from "react";

const COLORS = {
  healthy: "#2DD9C4",
  degraded: "#F5B942",
  outage: "#F0475F",
};

// Builds an SVG path string that looks like a heartbeat monitor line.
// A "healthy" connection gets a steady, confident beat. "Degraded" gets
// an irregular, jittery line. "Outage" gets a flat line - like a monitor
// flatlining.
function buildPath(status) {
  if (status === "outage") {
    return "M0,40 L800,40";
  }
  if (status === "degraded") {
    return "M0,40 L60,40 L80,15 L100,60 L120,25 L140,40 L220,40 L240,55 L260,20 L280,40 L360,40 L380,10 L400,50 L420,40 L500,40 L520,18 L540,45 L560,40 L640,40 L660,58 L680,22 L700,40 L800,40";
  }
  // healthy - a clean, regular heartbeat shape repeated
  return "M0,40 L70,40 L85,10 L100,65 L115,40 L160,40 L230,40 L245,10 L260,65 L275,40 L320,40 L390,40 L405,10 L420,65 L435,40 L480,40 L550,40 L565,10 L580,65 L595,40 L640,40 L710,40 L725,10 L740,65 L755,40 L800,40";
}

export default function HealthPulse({ status = "healthy", size = "large" }) {
  const color = COLORS[status] || COLORS.healthy;
  const path = useMemo(() => buildPath(status), [status]);
  const height = size === "large" ? 90 : 48;

  return (
    <div className="w-full" role="img" aria-label={`Connection vitals: ${status}`}>
      <svg
        viewBox="0 0 800 80"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={status === "outage" ? 2 : 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={status !== "outage" ? "animate-pulseLine" : ""}
          style={{
            strokeDasharray: 1000,
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
    </div>
  );
}
