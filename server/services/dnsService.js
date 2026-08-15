// dnsService.js
//
// Networking concept: DNS (Domain Name System) turns a human-friendly name
// like "google.com" into an IP address like "142.250.premium.4". If DNS is
// broken, your device can still be connected to the internet (it can reach
// IP addresses directly) but it can't turn *names* into addresses, so
// basically every website looks "down" even though the network is fine.
//
// We use Node's built-in `dns` module - specifically `dns.promises.lookup`,
// which asks the OPERATING SYSTEM to resolve the domain (the same path a
// browser or `https.get` uses under the hood - via getaddrinfo). This is a
// REAL lookup, not simulated.
//
// IMPLEMENTATION NOTE: Node also offers `dns.resolve()` / `dns.resolve4()`,
// which instead talk directly to the configured DNS nameservers over raw
// UDP port 53, bypassing the OS resolver entirely. On many real-world
// networks (VPNs with split-tunnel DNS, some routers, certain security
// software - this shows up often on Windows) that direct path gets blocked
// even though normal OS-level resolution works perfectly fine. Using
// `lookup()` here keeps this check consistent with how the rest of the
// app (and every browser) actually resolves domains, avoiding false
// "DNS is broken" diagnoses on networks where it demonstrably isn't.

const dns = require("dns").promises;

// A handful of well-known, highly-reliable domains. If we can't resolve
// ANY of these, DNS is almost certainly the problem (rather than one
// specific unlucky domain having an issue).
const DNS_TEST_DOMAINS = ["cloudflare.com", "google.com", "example.com"];

const DNS_TIMEOUT_MS = 3000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DNS lookup timed out")), ms)
    ),
  ]);
}

async function resolveDomain(domain) {
  const started = Date.now();
  try {
    const addresses = await withTimeout(
      dns.lookup(domain, { family: 4, all: true }),
      DNS_TIMEOUT_MS
    );
    return {
      domain,
      success: true,
      addresses: addresses.map((a) => a.address),
      durationMs: Date.now() - started,
    };
  } catch (err) {
    return {
      domain,
      success: false,
      error: err.code || err.message,
      durationMs: Date.now() - started,
    };
  }
}

// Runs DNS resolution against all test domains in parallel and summarizes
// the result. Returns whether DNS is considered healthy, degraded, or failing.
async function checkDns() {
  const results = await Promise.all(DNS_TEST_DOMAINS.map(resolveDomain));
  const successCount = results.filter((r) => r.success).length;

  let status;
  if (successCount === results.length) status = "healthy";
  else if (successCount > 0) status = "degraded";
  else status = "failed";

  return { status, results };
}

module.exports = { checkDns, DNS_TEST_DOMAINS };
