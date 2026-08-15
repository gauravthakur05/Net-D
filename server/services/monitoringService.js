// monitoringService.js
//
// Implements "Live Monitoring": when started, this runs the full diagnostic
// pipeline on an interval, keeps an in-memory timeline of state changes, and
// saves each run to history. It deliberately only adds a timeline entry
// when the status actually CHANGES, to avoid spamming the user with
// "still healthy" messages every 30 seconds.

const { runFullDiagnosis } = require("./diagnosticPipeline");
const { saveSession } = require("./historyService");

const CHECK_INTERVAL_MS = 45 * 1000; // 45s - within the requested 30-60s range
const MAX_TIMELINE_EVENTS = 100;

let intervalHandle = null;
let lastDiagnosisCode = null;
let latestResult = null;
const timeline = [];

function addTimelineEvent(label) {
  timeline.unshift({ time: new Date().toISOString(), label });
  if (timeline.length > MAX_TIMELINE_EVENTS) timeline.pop();
}

async function runOneCycle() {
  const result = await runFullDiagnosis();
  latestResult = result;

  // Only log a timeline event + save history when the diagnosis actually
  // changes - this is the "don't spam the user" rule from the spec.
  if (result.diagnosis.code !== lastDiagnosisCode) {
    addTimelineEvent(result.diagnosis.title);
    lastDiagnosisCode = result.diagnosis.code;
  }

  saveSession({
    healthScore: result.healthScore.total,
    diagnosisCode: result.diagnosis.code,
    diagnosisTitle: result.diagnosis.title,
    avgLatencyMs: result.endpoints.avgLatencyMs,
  });

  return result;
}

function isRunning() {
  return intervalHandle !== null;
}

async function start() {
  if (isRunning()) return { alreadyRunning: true };
  addTimelineEvent("Monitoring started");
  await runOneCycle(); // run immediately so the UI has data right away
  intervalHandle = setInterval(() => {
    // setInterval doesn't await, so a rejected promise here would otherwise
    // become an unhandled rejection. Catch it explicitly and log it instead
    // of letting one bad cycle silently stop future cycles.
    runOneCycle().catch((err) => {
      console.error("Monitoring cycle failed (will retry next interval):", err);
    });
  }, CHECK_INTERVAL_MS);
  return { alreadyRunning: false };
}

function stop() {
  if (!isRunning()) return { alreadyRunning: false };
  clearInterval(intervalHandle);
  intervalHandle = null;
  addTimelineEvent("Monitoring stopped");
  return { alreadyRunning: false };
}

function getStatus() {
  return {
    running: isRunning(),
    intervalMs: CHECK_INTERVAL_MS,
    latestResult,
    timeline,
  };
}

module.exports = { start, stop, getStatus };
