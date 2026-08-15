# 🩺 NetDoctor — Internet Blackout & Network Health Detector

NetDoctor is an "internet doctor" that tells you **why** your connection
isn't working — not just that it isn't. It distinguishes between a local
network problem, a DNS problem, an ISP-level problem, a single website
being down, or high latency — and gives you a plain-English diagnosis plus
recommended fixes.

## Architecture

```
React (client)
      ↓
Express API (server)
      ↓
Diagnostic Services (dns / http / tcp checks)
      ↓
Simple JSON file "database" (history)
```

No Docker, no microservices, no database engine — just two small apps you
run with `npm run dev`.

```
netdoctor/
  server/            Express backend — does the real network checks
    routes/api.js    All REST endpoints
    services/        DNS, HTTP, TCP, diagnosis engine, health score, history
    database/        history.json (simple file-based storage)
  client/             React (Vite) frontend
    src/pages/        Landing, Dashboard, Website Checker, History
    src/components/   Reusable UI pieces (health pulse, gauges, cards...)
    src/api/          Backend client + demo-mode data
```

## What's real vs. simulated

A browser cannot do raw pings, read Wi-Fi signal strength, or open raw
sockets — so NetDoctor is honest about what it can and can't check:

| Check | How it works | Real or simulated? |
|---|---|---|
| Local connectivity | Backend opens a raw TCP connection to 1.1.1.1 / 8.8.8.8 by IP (bypasses DNS) | **Real** |
| DNS resolution | Backend does real DNS lookups via Node's `dns` module | **Real** |
| Endpoint reachability & latency | Backend makes real HTTPS requests to Cloudflare/Google/Microsoft/GitHub and times them | **Real** (this is HTTP request latency/failure rate, never labeled as "ping" or "packet loss") |
| Wi-Fi signal, router info, raw packet loss | Not accessible from a browser or a normal Node process | **Unavailable from browser** — clearly labeled, never faked |
| Regional/global outage confidence | Would need many independent monitoring locations | **Demo / Simulated** when shown — clearly labeled |
| Demo Mode | Canned example scenarios (healthy, DNS failure, high latency, etc.) | **Always labeled "DEMO MODE"**, never mixed with real results |

## Running it locally

You'll need [Node.js](https://nodejs.org) 18+ installed.

**1. Start the backend**
```bash
cd server
npm install
npm start
```
This runs the API at `http://localhost:4000`.

**2. Start the frontend** (in a new terminal)
```bash
cd client
npm install
npm run dev
```
This runs the app at `http://localhost:5173` and proxies `/api` requests to
the backend automatically.

**3. Open your browser** to `http://localhost:5173`.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Backend health check |
| GET | `/api/diagnose` | Runs the full diagnostic pipeline |
| GET | `/api/dns-check` | DNS resolution only |
| GET | `/api/endpoints` | HTTP endpoint checks only |
| POST | `/api/website-check` | Check a single website (`{ "url": "..." }`) |
| GET | `/api/history` | Past diagnostic sessions |
| GET | `/api/monitoring/status` | Current monitoring state + timeline |
| POST | `/api/monitoring/start` | Start live monitoring (checks every 45s) |
| POST | `/api/monitoring/stop` | Stop live monitoring |

## Privacy

NetDoctor never collects browsing history, personal data, or private
network traffic. It only stores diagnostic results (health score, latency,
diagnosis) needed to show your history — nothing else.

## Extending it

- Add more endpoints in `server/services/httpCheckService.js`
- Adjust diagnosis rules in `server/services/diagnosisEngine.js`
- Adjust health score weighting in `server/services/healthScoreService.js`
- Swap the JSON file in `server/services/historyService.js` for a real
  database later if you outgrow it
