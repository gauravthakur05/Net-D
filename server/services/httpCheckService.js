// httpCheckService.js
//
// Networking concept: even if DNS works, a server on the other end might be
// slow, overloaded, or unreachable. We check this the only honest way a
// Node.js server can: by making a real HTTP request and timing how long it
// takes to get a response (or noticing that it fails/times out).
//
// IMPORTANT HONESTY NOTE: this measures "can we complete an HTTP request and
// how long did it take" - NOT raw ICMP ping, and NOT true packet loss.
// We deliberately label these as "HTTP request failures", never as
// "packet loss", per the project's accuracy requirements.

const https = require("https");

// Well-known, highly-available endpoints across different major providers.
// Using several avoids drawing conclusions from a single company's outage.
const DEFAULT_ENDPOINTS = [
  { name: "Cloudflare", url: "https://www.cloudflare.com" },
  { name: "Google", url: "https://www.google.com" },
  { name: "Microsoft", url: "https://www.microsoft.com" },
  { name: "GitHub", url: "https://github.com" },
];

const REQUEST_TIMEOUT_MS = 5000;

function checkUrl(url) {
  return new Promise((resolve) => {
    const started = Date.now();
    const req = https.get(
      url,
      { timeout: REQUEST_TIMEOUT_MS, headers: { "User-Agent": "NetDoctor/1.0" } },
      (res) => {
        // We only need the headers/status - drain and discard the body to
        // free up the socket quickly.
        res.on("data", () => {});
        res.on("end", () => {
          resolve({
            success: res.statusCode < 500,
            statusCode: res.statusCode,
            latencyMs: Date.now() - started,
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      resolve({ success: false, error: "timeout", latencyMs: Date.now() - started });
    });

    req.on("error", (err) => {
      resolve({ success: false, error: err.code || err.message, latencyMs: Date.now() - started });
    });
  });
}

async function checkEndpoints(endpoints = DEFAULT_ENDPOINTS) {
  const results = await Promise.all(
    endpoints.map(async (ep) => ({ name: ep.name, url: ep.url, ...(await checkUrl(ep.url)) }))
  );

  const successful = results.filter((r) => r.success);
  const failureRate = 1 - successful.length / results.length;
  const avgLatencyMs =
    successful.length > 0
      ? Math.round(successful.reduce((sum, r) => sum + r.latencyMs, 0) / successful.length)
      : null;

  return { results, failureRate, avgLatencyMs };
}

// Checks a single, user-supplied website (used by the "Is This Website Down?" page).
async function checkSingleWebsite(rawUrl) {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch {
    return { valid: false, error: "That doesn't look like a valid URL." };
  }

  const result = await checkUrl(url);
  return { valid: true, url, ...result };
}

module.exports = { checkEndpoints, checkSingleWebsite, DEFAULT_ENDPOINTS };
