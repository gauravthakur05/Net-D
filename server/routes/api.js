// routes/api.js
//
// All REST endpoints for NetDoctor, in one place so it's easy to see the
// whole API surface at a glance. Each route stays thin - the real work
// happens in services/.

const express = require("express");
const router = express.Router();

const { runFullDiagnosis } = require("../services/diagnosticPipeline");
const { checkDns } = require("../services/dnsService");
const { checkEndpoints, checkSingleWebsite, DEFAULT_ENDPOINTS } = require("../services/httpCheckService");
const { getHistory, getSessionById } = require("../services/historyService");
const monitoring = require("../services/monitoringService");

// Simple wrapper so every route has consistent error handling instead of
// crashing the server on an unexpected failure.
function safeRoute(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error("API error:", err);
      res.status(500).json({
        error: "We couldn't complete this check. Try again in a moment.",
      });
    }
  };
}

router.get("/health", safeRoute(async (req, res) => {
  res.json({ status: "ok", service: "netdoctor-server" });
}));

router.get("/diagnose", safeRoute(async (req, res) => {
  const websiteUrl = req.query.website || null;
  const result = await runFullDiagnosis({ websiteUrl });
  res.json(result);
}));

router.get("/dns-check", safeRoute(async (req, res) => {
  const result = await checkDns();
  res.json(result);
}));

router.get("/endpoints", safeRoute(async (req, res) => {
  const result = await checkEndpoints();
  res.json({ endpoints: DEFAULT_ENDPOINTS, ...result });
}));

router.post("/website-check", safeRoute(async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Please provide a 'url' field." });
  }
  const result = await checkSingleWebsite(url);
  if (!result.valid) return res.status(400).json(result);
  res.json(result);
}));

router.get("/history", safeRoute(async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  res.json({ sessions: getHistory(limit) });
}));

router.get("/history/:id", safeRoute(async (req, res) => {
  const session = getSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found." });
  res.json(session);
}));

router.get("/monitoring/status", safeRoute(async (req, res) => {
  res.json(monitoring.getStatus());
}));

router.post("/monitoring/start", safeRoute(async (req, res) => {
  const result = await monitoring.start();
  res.json({ started: true, ...result });
}));

router.post("/monitoring/stop", safeRoute(async (req, res) => {
  const result = monitoring.stop();
  res.json({ stopped: true, ...result });
}));

module.exports = router;
