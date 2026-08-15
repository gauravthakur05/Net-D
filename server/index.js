// index.js
//
// NetDoctor backend entry point. Deliberately simple:
//   React client  ->  Express API  ->  Diagnostic services  ->  JSON file
//
// No microservices, no Docker required, no database engine.

const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

// Friendly fallback for unknown routes instead of a default Express error page.
app.use((req, res) => {
  res.status(404).json({ error: "Unknown endpoint." });
});

// Catch-all so a single failed check never crashes the whole server.
// Without these, an unexpected error in any one diagnostic check (a DNS
// lookup, a TCP probe, an HTTPS request) could otherwise terminate the
// entire Node process, which is why the client sees ECONNREFUSED on every
// request afterward.
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection (server stayed up):", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception (server stayed up):", err);
});

app.listen(PORT, () => {
  console.log(`🩺 NetDoctor server running at http://localhost:${PORT}`);
});
