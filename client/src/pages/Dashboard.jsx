import React, { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api/client.js";
import { getDemoScenario, demoScenarioList } from "../api/demoData.js";
import HealthPulse from "../components/HealthPulse.jsx";
import HealthScoreGauge from "../components/HealthScoreGauge.jsx";
import EndpointCard from "../components/EndpointCard.jsx";
import DiagnosisPanel from "../components/DiagnosisPanel.jsx";
import Timeline from "../components/Timeline.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const STEPS = [
  { key: "connectivity", label: "Checking local connection..." },
  { key: "dns", label: "Testing DNS..." },
  { key: "endpoints", label: "Testing internet endpoints..." },
  { key: "latency", label: "Checking latency..." },
  { key: "diagnosis", label: "Generating diagnosis..." },
];

export default function Dashboard({ isDemo }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [monitoring, setMonitoring] = useState({ running: false, timeline: [] });
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [demoScenario, setDemoScenario] = useState("healthy");
  const notifiedCodeRef = useRef(null);
  const [notification, setNotification] = useState(null);

  const runDiagnosis = useCallback(async () => {
    setError(null);
    setLoading(true);
    setStepIndex(0);

    // Play a short step animation so the user can see what's being checked,
    // regardless of whether we're using real or demo data.
    for (let i = 0; i < STEPS.length - 1; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 350));
      setStepIndex(i + 1);
    }

    try {
      let data;
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 350));
        data = getDemoScenario(demoScenario);
      } else {
        data = await api.diagnose();
      }
      setResult(data);
      if (data.endpoints?.avgLatencyMs != null) {
        setLatencyHistory((prev) =>
          [...prev, { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), latency: data.endpoints.avgLatencyMs }].slice(-20)
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStepIndex(-1);
    }
  }, [isDemo, demoScenario]);

  // Poll monitoring status while it's running, so the dashboard updates live.
  useEffect(() => {
    if (isDemo) return;
    let poll;
    const tick = async () => {
      try {
        const status = await api.monitoringStatus();
        setMonitoring(status);
        if (status.latestResult) {
          setResult(status.latestResult);
          const code = status.latestResult.diagnosis.code;
          if (notifiedCodeRef.current && notifiedCodeRef.current !== code) {
            setNotification(status.latestResult.diagnosis.title);
            setTimeout(() => setNotification(null), 6000);
          }
          notifiedCodeRef.current = code;
        }
      } catch {
        /* silent - dashboard just won't update this tick */
      }
    };
    tick();
    poll = setInterval(tick, 10000);
    return () => clearInterval(poll);
  }, [isDemo]);

  const toggleMonitoring = async () => {
    try {
      if (monitoring.running) {
        await api.monitoringStop();
      } else {
        await api.monitoringStart();
      }
      const status = await api.monitoringStatus();
      setMonitoring(status);
    } catch (err) {
      setError(err.message);
    }
  };

  const overallStatus = result?.healthScore?.status || result?.diagnosis?.severity || "healthy";
  const normalizedStatus =
    overallStatus === "critical" ? "outage" : overallStatus === "warning" ? "degraded" : overallStatus;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {isDemo && (
        <div className="flex flex-wrap items-center gap-3 text-sm bg-vital-warning/10 border border-vital-warning/30 text-vital-warning rounded-xl px-4 py-3">
          <span className="font-mono font-semibold">DEMO MODE</span>
          <span>Showing simulated data, not a real diagnosis.</span>
          <select
            value={demoScenario}
            onChange={(e) => setDemoScenario(e.target.value)}
            className="ml-auto bg-transparent border border-vital-warning/30 rounded-lg px-2 py-1 text-xs"
          >
            {demoScenarioList.map((s) => (
              <option key={s.key} value={s.key} className="text-ink-light">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {notification && (
        <div className="fixed top-20 right-6 z-40 bg-surface border border-border rounded-xl px-4 py-3 shadow-lg animate-fadeUp text-sm">
          {notification}
        </div>
      )}

      {/* Vitals hero card */}
      <div className="card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <HealthScoreGauge score={result?.healthScore?.total ?? 0} status={normalizedStatus} />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-ink-muted font-mono mb-1">
              INTERNET STATUS
            </p>
            <h2 className="font-display text-2xl font-semibold mb-3">
              {result ? result.diagnosis.title : "Run a diagnosis to see your status"}
            </h2>
            <HealthPulse status={normalizedStatus} />
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={runDiagnosis}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-vital-healthy text-base font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Diagnosing..." : "Run Full Diagnosis"}
              </button>
              {!isDemo && (
                <button
                  onClick={toggleMonitoring}
                  className={`px-5 py-2.5 rounded-xl border transition-colors ${
                    monitoring.running
                      ? "border-vital-critical/40 text-vital-critical hover:bg-vital-critical/10"
                      : "border-border text-ink hover:bg-surface"
                  }`}
                >
                  {monitoring.running ? "Stop Monitoring" : "Start Monitoring"}
                </button>
              )}
              {monitoring.running && <StatusBadge status="healthy">🟢 Monitoring active</StatusBadge>}
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-6 border-t border-border pt-4 space-y-2 font-mono text-sm">
            {STEPS.map((step, i) => (
              <div
                key={step.key}
                className={`flex items-center gap-2 transition-opacity ${
                  i <= stepIndex ? "opacity-100" : "opacity-30"
                }`}
              >
                <span>{i < stepIndex ? "✓" : i === stepIndex ? "…" : "○"}</span>
                {step.label}
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-vital-critical bg-vital-critical/10 border border-vital-critical/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {result && (
        <>
          {/* Endpoint status grid */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-3">Global Endpoint Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {result.endpoints.results.map((ep) => (
                <EndpointCard key={ep.name} {...ep} />
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <DiagnosisPanel diagnosis={result.diagnosis} />

            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Latency Over Time</h3>
              {latencyHistory.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={latencyHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22304A" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#8A97B3" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#8A97B3" }} unit="ms" />
                    <Tooltip contentStyle={{ background: "#121B2E", border: "1px solid #22304A", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="latency" stroke="#2DD9C4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-ink-muted">
                  Run a few diagnoses to build a latency trend chart.
                </p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Outage Timeline</h3>
            <Timeline events={monitoring.timeline} />
          </div>
        </>
      )}
    </div>
  );
}
