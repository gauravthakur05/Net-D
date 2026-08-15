// healthScoreService.js
//
// Combines the individual checks into a single 0-100 "NetDoctor Health
// Score". This is our own composite metric, not an official measurement
// from any ISP or standards body - we always label it clearly as such
// in the UI.
//
// Weighting (out of 100):
//   Local connectivity  -> 25 points
//   DNS                 -> 25 points
//   Endpoint success     -> 30 points (scaled by % of endpoints reachable)
//   Latency              -> 20 points (full points under 150ms, 0 points over 500ms)

function scoreConnectivity(connectivity) {
  if (connectivity.status === "healthy") return 25;
  if (connectivity.status === "degraded") return 12;
  return 0;
}

function scoreDns(dns) {
  if (dns.status === "healthy") return 25;
  if (dns.status === "degraded") return 12;
  return 0;
}

function scoreEndpoints(endpoints) {
  const successRatio = 1 - endpoints.failureRate;
  return Math.round(successRatio * 30);
}

function scoreLatency(endpoints) {
  if (endpoints.avgLatencyMs === null) return 0;
  if (endpoints.avgLatencyMs <= 150) return 20;
  if (endpoints.avgLatencyMs >= 500) return 0;
  // Linear scale between 150ms (20 pts) and 500ms (0 pts)
  const ratio = 1 - (endpoints.avgLatencyMs - 150) / (500 - 150);
  return Math.round(ratio * 20);
}

function calculateHealthScore({ connectivity, dns, endpoints }) {
  const connectivityPts = scoreConnectivity(connectivity);
  const dnsPts = scoreDns(dns);
  const endpointPts = scoreEndpoints(endpoints);
  const latencyPts = scoreLatency(endpoints);

  const total = connectivityPts + dnsPts + endpointPts + latencyPts;

  let status;
  if (total >= 85) status = "healthy";
  else if (total >= 50) status = "degraded";
  else status = "outage";

  return {
    total,
    status,
    breakdown: {
      connectivity: connectivityPts,
      dns: dnsPts,
      endpoints: endpointPts,
      latency: latencyPts,
    },
  };
}

module.exports = { calculateHealthScore };
