import React from "react";

export default function EndpointCard({ name, success, latencyMs, error }) {
  return (
    <div className="card p-4 flex flex-col gap-2 animate-fadeUp">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{name}</span>
        <span className={success ? "text-vital-healthy" : "text-vital-critical"}>
          {success ? "🟢" : "🔴"}
        </span>
      </div>
      <div className="font-mono text-2xl">
        {success ? (
          <>
            {latencyMs}
            <span className="text-sm text-ink-muted ml-1">ms</span>
          </>
        ) : (
          <span className="text-sm text-vital-critical">{error || "Unreachable"}</span>
        )}
      </div>
      <span className="text-xs text-ink-muted">
        {success ? "Online" : "Offline"}
      </span>
    </div>
  );
}
