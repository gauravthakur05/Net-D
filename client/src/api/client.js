// client.js
//
// Thin wrapper around fetch() for talking to the NetDoctor backend.
// Kept intentionally simple - no heavy data-fetching library needed for
// a beginner-friendly project.

const BASE = "/api";

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Something went wrong.");
    }
    return data;
  } catch (err) {
    if (err.name === "TypeError") {
      // Usually means the backend isn't running / isn't reachable
      throw new Error(
        "Can't reach the NetDoctor server. Is the backend running on port 4000?"
      );
    }
    throw err;
  }
}

export const api = {
  health: () => request("/health"),
  diagnose: (websiteUrl) =>
    request(`/diagnose${websiteUrl ? `?website=${encodeURIComponent(websiteUrl)}` : ""}`),
  dnsCheck: () => request("/dns-check"),
  endpoints: () => request("/endpoints"),
  websiteCheck: (url) =>
    request("/website-check", { method: "POST", body: JSON.stringify({ url }) }),
  history: (limit = 50) => request(`/history?limit=${limit}`),
  historyById: (id) => request(`/history/${id}`),
  monitoringStatus: () => request("/monitoring/status"),
  monitoringStart: () => request("/monitoring/start", { method: "POST" }),
  monitoringStop: () => request("/monitoring/stop", { method: "POST" }),
};
