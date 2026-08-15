// connectivityService.js
//
// Networking concept: this check tries to open a raw TCP connection directly
// to an IP ADDRESS (not a domain name) on port 443 (HTTPS). Because it uses
// an IP address, it does NOT depend on DNS at all. This lets us tell the
// difference between:
//   - "the network path out to the internet is broken" (this check fails)
//   - "the network is fine but domain names won't resolve" (this check
//      succeeds, but the DNS check fails)
//
// We use Cloudflare's public IP (1.1.1.1) and Google's public IP (8.8.8.8)
// since both run extremely reliable, always-on services on port 443.
//
// HONESTY NOTE: this tells us about the network path FROM THIS SERVER. A
// browser cannot open raw sockets at all, which is why this check has to
// live in the Node backend rather than the React frontend.

const net = require("net");

const PROBE_TARGETS = [
  { name: "Cloudflare (1.1.1.1)", ip: "1.1.1.1", port: 443 },
  { name: "Google (8.8.8.8)", ip: "8.8.8.8", port: 443 },
];

const CONNECT_TIMEOUT_MS = 3000;

function probe(target) {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = new net.Socket();
    let settled = false;

    const finish = (success, error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ...target, success, error, latencyMs: Date.now() - started });
    };

    socket.setTimeout(CONNECT_TIMEOUT_MS);
    socket.once("connect", () => finish(true, null));
    socket.once("timeout", () => finish(false, "timeout"));
    socket.once("error", (err) => finish(false, err.code || err.message));

    socket.connect(target.port, target.ip);
  });
}

async function checkLocalConnectivity() {
  const results = await Promise.all(PROBE_TARGETS.map(probe));
  const successCount = results.filter((r) => r.success).length;

  let status;
  if (successCount === results.length) status = "healthy";
  else if (successCount > 0) status = "degraded";
  else status = "failed";

  return { status, results };
}

module.exports = { checkLocalConnectivity };
