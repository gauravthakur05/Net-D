import React from "react";
import { Link } from "react-router-dom";
import HealthPulse from "../components/HealthPulse.jsx";

const FEATURES = [
  { icon: "🩺", title: "Smart Diagnosis", desc: "Rule-based engine pinpoints whether it's your device, DNS, ISP, or a website." },
  { icon: "🔎", title: "DNS Testing", desc: "Real DNS resolution checks against multiple reliable domains." },
  { icon: "📈", title: "Latency Monitoring", desc: "Tracks response times across major providers over time." },
  { icon: "🌐", title: "Website Checker", desc: "Find out if it's really down, or just down for you." },
  { icon: "⚡", title: "Outage Detection", desc: "Distinguishes local, ISP, and website-specific problems." },
  { icon: "🕒", title: "Network History", desc: "Review past diagnostic sessions and what changed." },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-vital-healthy border border-vital-healthy/30 bg-vital-healthy/10 rounded-full px-3 py-1 mb-6">
          🩺 A doctor for your internet connection
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.1] tracking-tight">
          Is Your Internet
          <br />
          <span className="text-vital-healthy">Actually Down?</span>
        </h1>
        <p className="text-ink-muted mt-6 max-w-xl mx-auto text-lg">
          NetDoctor diagnoses whether the problem is your device, DNS, ISP, a
          website, or the wider internet — instead of just saying "offline."
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-vital-healthy text-base font-semibold hover:opacity-90 transition-opacity shadow-glow"
          >
            Run Diagnosis
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl border border-border text-ink hover:bg-surface transition-colors"
          >
            View Dashboard
          </Link>
        </div>

        <div className="mt-16 card p-6 max-w-2xl mx-auto text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-ink-muted">LIVE VITALS PREVIEW</span>
            <span className="text-xs font-mono text-vital-healthy">🟢 Healthy</span>
          </div>
          <HealthPulse status="healthy" />
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-display font-semibold mt-3">{f.title}</h3>
              <p className="text-sm text-ink-muted mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
