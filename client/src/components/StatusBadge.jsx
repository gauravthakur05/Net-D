import React from "react";

const STYLES = {
  healthy: "bg-vital-healthy/10 text-vital-healthy border-vital-healthy/30",
  degraded: "bg-vital-warning/10 text-vital-warning border-vital-warning/30",
  outage: "bg-vital-critical/10 text-vital-critical border-vital-critical/30",
  warning: "bg-vital-warning/10 text-vital-warning border-vital-warning/30",
  critical: "bg-vital-critical/10 text-vital-critical border-vital-critical/30",
};

const LABELS = {
  healthy: "🟢 Healthy",
  degraded: "🟡 Degraded",
  outage: "🔴 Outage",
  warning: "🟡 Degraded",
  critical: "🔴 Outage",
};

export default function StatusBadge({ status, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium font-mono ${
        STYLES[status] || STYLES.healthy
      }`}
    >
      {children || LABELS[status] || status}
    </span>
  );
}
