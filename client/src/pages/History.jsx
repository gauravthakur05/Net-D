import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";

function formatDate(iso) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DEMO_HISTORY = [
  { id: "1", timestamp: new Date().toISOString(), healthScore: 92, diagnosisTitle: "🟢 Internet Connection Is Healthy", avgLatencyMs: 28 },
  { id: "2", timestamp: new Date(Date.now() - 86400000).toISOString(), healthScore: 61, diagnosisTitle: "🔴 DNS Issue", avgLatencyMs: 84 },
  { id: "3", timestamp: new Date(Date.now() - 172800000).toISOString(), healthScore: 87, diagnosisTitle: "🟡 High Latency Detected", avgLatencyMs: 143 },
];

export default function History({ isDemo }) {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isDemo) {
          setSessions(DEMO_HISTORY);
        } else {
          const data = await api.history();
          setSessions(data.sessions);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isDemo]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">History</h1>
      <p className="text-ink-muted mt-2">Previous diagnostic sessions recorded during monitoring.</p>
      {isDemo && <p className="mt-2 text-xs font-mono text-vital-warning">DEMO MODE — simulated history</p>}

      {loading && <p className="mt-8 text-sm text-ink-muted">Loading...</p>}
      {error && <p className="mt-8 text-sm text-vital-critical">{error}</p>}

      {!loading && !error && sessions.length === 0 && (
        <p className="mt-8 text-sm text-ink-muted">
          No sessions yet. Start monitoring on the Dashboard to build a history.
        </p>
      )}

      {sessions.length > 0 && (
        <div className="mt-8 card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-base/50 text-ink-muted text-left font-mono text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Diagnosis</th>
                <th className="px-4 py-3">Avg Latency</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3">{formatDate(s.timestamp)}</td>
                  <td className="px-4 py-3 font-mono">{s.healthScore}</td>
                  <td className="px-4 py-3">{s.diagnosisTitle}</td>
                  <td className="px-4 py-3 font-mono">
                    {s.avgLatencyMs != null ? `${s.avgLatencyMs} ms` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
