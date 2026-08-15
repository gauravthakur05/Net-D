// diagnosisEngine.js
//
// This is the heart of NetDoctor. It takes the raw results from the three
// checks (local connectivity, DNS, HTTP endpoints) and applies simple,
// transparent if/else rules to produce a human-readable diagnosis.
//
// Deliberately kept as plain if/else logic (no machine learning, no hidden
// scoring model) so it's easy to read, trust, and extend.

const HIGH_LATENCY_THRESHOLD_MS = 300;

function diagnose({ connectivity, dns, endpoints, websiteCheck }) {
  const localFailed = connectivity.status === "failed";
  const dnsFailed = dns.status === "failed";
  const dnsDegraded = dns.status === "degraded";
  const endpointsAllFailed = endpoints.results.every((r) => !r.success);
  const endpointsSomeFailed = endpoints.results.some((r) => !r.success);
  const highLatency =
    endpoints.avgLatencyMs !== null && endpoints.avgLatencyMs > HIGH_LATENCY_THRESHOLD_MS;

  // Case: Local network problem - nothing works at any layer.
  if (localFailed && dnsFailed && endpointsAllFailed) {
    return {
      code: "LOCAL_NETWORK_DOWN",
      severity: "critical",
      title: "🔴 Local Network Problem",
      summary:
        "Your device can't reach the network at all. This usually means the problem is with your Wi-Fi, router, or cable - not your ISP or a website.",
      findings: [
        { ok: false, label: "Network connection available" },
        { ok: false, label: "DNS resolution" },
        { ok: false, label: "Internet endpoints reachable" },
      ],
      recommendedFix: [
        "Check that your Wi-Fi or ethernet cable is actually connected.",
        "Restart your router and modem (unplug for 10 seconds).",
        "Try connecting a different device to the same network.",
        "If nothing connects on any device, contact your ISP.",
      ],
    };
  }

  // Case: DNS is broken but the network path itself is fine.
  if (!localFailed && dnsFailed) {
    return {
      code: "DNS_ISSUE",
      severity: "critical",
      title: "🔴 DNS Issue",
      summary:
        "Your network connection is working, but domain names (like google.com) can't be resolved into addresses. Websites will look 'down' even though the internet itself is fine.",
      findings: [
        { ok: true, label: "Network connection available" },
        { ok: false, label: "DNS resolution failing" },
        { ok: endpoints.results.some((r) => r.success), label: "Internet endpoints reachable" },
      ],
      recommendedFix: [
        "Try switching your DNS server to Cloudflare (1.1.1.1) or Google (8.8.8.8).",
        "Restart your router - many routers act as a DNS relay.",
        "Check whether other devices on your network have the same problem.",
        "Contact your ISP if switching DNS servers doesn't help.",
      ],
    };
  }

  // Case: One specific website is down but everything else is fine.
  if (websiteCheck && !websiteCheck.success && !endpointsAllFailed && dns.status === "healthy") {
    return {
      code: "WEBSITE_SPECIFIC",
      severity: "warning",
      title: "🟡 Website-Specific Outage",
      summary: `Your internet is working normally, but ${websiteCheck.url} appears unreachable. The problem is most likely on that site's end, not yours.`,
      findings: [
        { ok: true, label: "Network connection available" },
        { ok: true, label: "DNS resolution" },
        { ok: true, label: "Other internet endpoints reachable" },
        { ok: false, label: `${websiteCheck.url} reachable` },
      ],
      recommendedFix: [
        "Wait a few minutes and try again - the site may be temporarily overloaded.",
        "Check the website's official status page or social media for outage reports.",
        "Try accessing it from a different network to confirm it's not just you.",
      ],
    };
  }

  // Case: Several major endpoints are unreachable but DNS/local look fine -
  // points toward an ISP-level problem.
  if (!localFailed && !dnsFailed && endpointsSomeFailed) {
    return {
      code: "ISP_ISSUE",
      severity: "critical",
      title: "🔴 Possible ISP Connectivity Problem",
      summary:
        "Your local network and DNS look fine, but multiple independent internet services are unreachable. This pattern often points to a problem at your Internet Service Provider.",
      findings: [
        { ok: true, label: "Network connection available" },
        { ok: true, label: "DNS resolution" },
        { ok: false, label: "Multiple internet endpoints reachable" },
      ],
      recommendedFix: [
        "Restart your router and modem.",
        "Check your ISP's outage map or status page.",
        "Try a mobile hotspot to confirm whether the issue follows your ISP.",
        "Contact your ISP if the problem continues.",
      ],
    };
  }

  // Case: Everything connects, but it's slow.
  if (highLatency) {
    return {
      code: "HIGH_LATENCY",
      severity: "warning",
      title: "🟡 High Latency Detected",
      summary: `Everything is reachable, but response times are unusually slow (avg ${endpoints.avgLatencyMs} ms). This can cause lag in calls, games, or streaming without a full outage.`,
      findings: [
        { ok: true, label: "Network connection available" },
        { ok: true, label: "DNS resolution" },
        { ok: true, label: "Internet endpoints reachable" },
        { ok: false, label: "Latency within normal range" },
      ],
      recommendedFix: [
        "Move closer to your Wi-Fi router or switch to a wired connection.",
        "Check if other devices on your network are using heavy bandwidth.",
        "Restart your router if slowness persists.",
      ],
    };
  }

  // Case: All good.
  return {
    code: "HEALTHY",
    severity: "healthy",
    title: "🟢 Internet Connection Is Healthy",
    summary: "Local network, DNS, and internet endpoints all look good. No issues detected.",
    findings: [
      { ok: true, label: "Network connection available" },
      { ok: true, label: "DNS resolution" },
      { ok: true, label: "Internet endpoints reachable" },
      { ok: !highLatency, label: "Latency within normal range" },
    ],
    recommendedFix: [],
  };
}

module.exports = { diagnose, HIGH_LATENCY_THRESHOLD_MS };
