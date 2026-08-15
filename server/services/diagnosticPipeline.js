// diagnosticPipeline.js
//
// Orchestrates the full diagnostic pipeline described in the spec:
//   Step 1: Local connectivity
//   Step 2: DNS
//   Step 3: Internet endpoints (also gives us latency + failure rate)
//   Step 4: Diagnosis engine
//   Step 5: Health score
//
// Kept as one small function so the flow is easy to follow beginning to end.

const { checkLocalConnectivity } = require("./connectivityService");
const { checkDns } = require("./dnsService");
const { checkEndpoints } = require("./httpCheckService");
const { checkSingleWebsite } = require("./httpCheckService");
const { diagnose } = require("./diagnosisEngine");
const { calculateHealthScore } = require("./healthScoreService");

async function runFullDiagnosis({ websiteUrl } = {}) {
  const [connectivity, dns, endpoints] = await Promise.all([
    checkLocalConnectivity(),
    checkDns(),
    checkEndpoints(),
  ]);

  const websiteCheck = websiteUrl ? await checkSingleWebsite(websiteUrl) : null;

  const diagnosis = diagnose({ connectivity, dns, endpoints, websiteCheck });
  const healthScore = calculateHealthScore({ connectivity, dns, endpoints });

  return {
    timestamp: new Date().toISOString(),
    connectivity,
    dns,
    endpoints,
    websiteCheck,
    diagnosis,
    healthScore,
  };
}

module.exports = { runFullDiagnosis };
