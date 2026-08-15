// demoData.js
//
// DEMO MODE ONLY. These functions generate fake diagnostic results so the
// UI can be shown off without a live backend or real network problems.
// Every result carries `demo: true` so components can visibly label it
// "DEMO MODE" and it can never be confused with a real check.

const scenarios = {
  healthy: () => ({
    demo: true,
    diagnosis: {
      code: "HEALTHY",
      severity: "healthy",
      title: "🟢 Internet Connection Is Healthy",
      summary: "Local network, DNS, and internet endpoints all look good. No issues detected.",
      findings: [
        { ok: true, label: "Network connection available" },
        { ok: true, label: "DNS resolution" },
        { ok: true, label: "Internet endpoints reachable" },
        { ok: true, label: "Latency within normal range" },
      ],
      recommendedFix: [],
    },
    healthScore: { total: 96, status: "healthy", breakdown: { connectivity: 25, dns: 25, endpoints: 30, latency: 16 } },
    endpoints: {
      results: [
        { name: "Cloudflare", success: true, latencyMs: 22 },
        { name: "Google", success: true, latencyMs: 31 },
        { name: "Microsoft", success: true, latencyMs: 28 },
        { name: "GitHub", success: true, latencyMs: 40 },
      ],
      avgLatencyMs: 30,
      failureRate: 0,
    },
  }),

  dnsFailure: () => ({
    demo: true,
    diagnosis: {
      code: "DNS_ISSUE",
      severity: "critical",
      title: "🔴 DNS Issue",
      summary:
        "Your network connection is working, but domain names can't be resolved into addresses.",
      findings: [
        { ok: true, label: "Network connection available" },
        { ok: false, label: "DNS resolution failing" },
        { ok: false, label: "Internet endpoints reachable" },
      ],
      recommendedFix: [
        "Try switching your DNS server to Cloudflare (1.1.1.1) or Google (8.8.8.8).",
        "Restart your router.",
        "Contact your ISP if switching DNS doesn't help.",
      ],
    },
    healthScore: { total: 38, status: "outage", breakdown: { connectivity: 25, dns: 0, endpoints: 5, latency: 8 } },
    endpoints: {
      results: [
        { name: "Cloudflare", success: false, error: "ENOTFOUND" },
        { name: "Google", success: false, error: "ENOTFOUND" },
        { name: "Microsoft", success: false, error: "ENOTFOUND" },
        { name: "GitHub", success: false, error: "ENOTFOUND" },
      ],
      avgLatencyMs: null,
      failureRate: 1,
    },
  }),

  highLatency: () => ({
    demo: true,
    diagnosis: {
      code: "HIGH_LATENCY",
      severity: "warning",
      title: "🟡 High Latency Detected",
      summary: "Everything is reachable, but response times are unusually slow (avg 462 ms).",
      findings: [
        { ok: true, label: "Network connection available" },
        { ok: true, label: "DNS resolution" },
        { ok: true, label: "Internet endpoints reachable" },
        { ok: false, label: "Latency within normal range" },
      ],
      recommendedFix: [
        "Move closer to your Wi-Fi router or switch to a wired connection.",
        "Check if other devices are using heavy bandwidth.",
      ],
    },
    healthScore: { total: 64, status: "degraded", breakdown: { connectivity: 25, dns: 25, endpoints: 30, latency: 2 } },
    endpoints: {
      results: [
        { name: "Cloudflare", success: true, latencyMs: 420 },
        { name: "Google", success: true, latencyMs: 510 },
        { name: "Microsoft", success: true, latencyMs: 460 },
        { name: "GitHub", success: true, latencyMs: 458 },
      ],
      avgLatencyMs: 462,
      failureRate: 0,
    },
  }),

  websiteOutage: () => ({
    demo: true,
    diagnosis: {
      code: "WEBSITE_SPECIFIC",
      severity: "warning",
      title: "🟡 Website-Specific Outage",
      summary: "Your internet is working normally, but example.com appears unreachable.",
      findings: [
        { ok: true, label: "Network connection available" },
        { ok: true, label: "DNS resolution" },
        { ok: true, label: "Other internet endpoints reachable" },
        { ok: false, label: "example.com reachable" },
      ],
      recommendedFix: [
        "Wait a few minutes and try again.",
        "Check the website's official status page.",
      ],
    },
    healthScore: { total: 88, status: "healthy", breakdown: { connectivity: 25, dns: 25, endpoints: 30, latency: 8 } },
    endpoints: {
      results: [
        { name: "Cloudflare", success: true, latencyMs: 25 },
        { name: "Google", success: true, latencyMs: 33 },
        { name: "Microsoft", success: true, latencyMs: 29 },
        { name: "GitHub", success: true, latencyMs: 44 },
      ],
      avgLatencyMs: 33,
      failureRate: 0,
    },
  }),

  outage: () => ({
    demo: true,
    diagnosis: {
      code: "LOCAL_NETWORK_DOWN",
      severity: "critical",
      title: "🔴 Local Network Problem",
      summary: "Your device can't reach the network at all.",
      findings: [
        { ok: false, label: "Network connection available" },
        { ok: false, label: "DNS resolution" },
        { ok: false, label: "Internet endpoints reachable" },
      ],
      recommendedFix: [
        "Check that your Wi-Fi or ethernet cable is actually connected.",
        "Restart your router and modem.",
        "Contact your ISP if nothing connects on any device.",
      ],
    },
    healthScore: { total: 4, status: "outage", breakdown: { connectivity: 0, dns: 0, endpoints: 0, latency: 0 } },
    endpoints: {
      results: [
        { name: "Cloudflare", success: false, error: "timeout" },
        { name: "Google", success: false, error: "timeout" },
        { name: "Microsoft", success: false, error: "timeout" },
        { name: "GitHub", success: false, error: "timeout" },
      ],
      avgLatencyMs: null,
      failureRate: 1,
    },
  }),
};

export function getDemoScenario(key) {
  const builder = scenarios[key] || scenarios.healthy;
  return builder();
}

export const demoScenarioList = [
  { key: "healthy", label: "Healthy connection" },
  { key: "dnsFailure", label: "DNS failure" },
  { key: "highLatency", label: "High latency" },
  { key: "websiteOutage", label: "Website outage" },
  { key: "outage", label: "Internet outage" },
];
