import React, { useState } from "react";
import { api } from "../api/client.js";

export default function WebsiteChecker({ isDemo }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 500));
        setResult({
          demo: true,
          valid: true,
          url,
          success: Math.random() > 0.3,
          statusCode: 200,
          latencyMs: 180 + Math.round(Math.random() * 100),
        });
      } else {
        const data = await api.websiteCheck(url);
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-center">Is This Website Down?</h1>
      <p className="text-ink-muted text-center mt-2">
        Check whether a specific website is reachable from here.
      </p>

      {isDemo && (
        <p className="mt-4 text-center text-xs font-mono text-vital-warning">DEMO MODE — simulated result</p>
      )}

      <form onSubmit={handleCheck} className="mt-8 flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-vital-healthy text-base font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Checking..." : "Check Website"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-vital-critical bg-vital-critical/10 border border-vital-critical/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {result && result.valid && (
        <div className="mt-8 card p-6 space-y-3 animate-fadeUp">
          <p className="text-sm text-ink-muted">Website: <span className="font-mono">{result.url}</span></p>
          <p>
            Status:{" "}
            <span className={result.success ? "text-vital-healthy" : "text-vital-critical"}>
              {result.success ? "🟢 Reachable" : "🔴 Unreachable"}
            </span>
          </p>
          {result.success ? (
            <>
              <p className="text-sm">Response Time: <span className="font-mono">{result.latencyMs} ms</span></p>
              <p className="text-sm">HTTP Status: <span className="font-mono">{result.statusCode}</span></p>
            </>
          ) : (
            <>
              <p className="text-sm">Your internet: <span className="text-vital-healthy">🟢 Working</span></p>
              <p className="text-sm text-ink-muted pt-2 border-t border-border">
                Conclusion: the problem may be specific to this website, not your connection.
              </p>
            </>
          )}
        </div>
      )}

      {result && result.valid === false && (
        <p className="mt-6 text-sm text-vital-critical">{result.error}</p>
      )}
    </div>
  );
}
