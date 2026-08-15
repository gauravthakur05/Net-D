// historyService.js
//
// Keeps a simple "Simple Database" as requested by the brief - just a JSON
// file on disk. No database engine required. This is intentionally basic;
// for a real production app you'd swap this for SQLite/Postgres, but for a
// beginner-friendly project this keeps things transparent and dependency-free.

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database", "history.json");
const MAX_ENTRIES = 200; // avoid the file growing forever

function readAll() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(entries) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(entries, null, 2));
  } catch (err) {
    // History is a "nice to have" - never let a disk/permissions issue
    // break the actual diagnosis the user is waiting on.
    console.error("Could not write history.json (history was not saved):", err.message);
  }
}

// Only stores diagnostic results - no browsing history, no personal data.
function saveSession(session) {
  const entries = readAll();
  entries.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    ...session,
  });
  writeAll(entries.slice(0, MAX_ENTRIES));
}

function getHistory(limit = 50) {
  return readAll().slice(0, limit);
}

function getSessionById(id) {
  return readAll().find((entry) => entry.id === id) || null;
}

module.exports = { saveSession, getHistory, getSessionById };
