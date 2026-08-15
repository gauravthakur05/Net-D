import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
    isActive ? "text-vital-healthy bg-vital-healthy/10" : "text-ink-muted hover:text-ink"
  }`;

export default function Navbar({ isDemo, onToggleDemo, isLight, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border backdrop-blur bg-base/80 light-mode:bg-base-light/80">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-display font-semibold text-lg">
          <span className="text-vital-healthy">🩺</span>
          NetDoctor
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/website-checker" className={linkClass}>Website Checker</NavLink>
          <NavLink to="/history" className={linkClass}>History</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDemo}
            className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${
              isDemo
                ? "border-vital-warning/40 bg-vital-warning/10 text-vital-warning"
                : "border-border text-ink-muted hover:text-ink"
            }`}
            title="Toggle demo mode - shows simulated data, never mixed with real checks"
          >
            {isDemo ? "DEMO MODE" : "Demo Mode"}
          </button>
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-ink-muted hover:text-ink transition-colors"
            aria-label="Toggle dark or light mode"
          >
            {isLight ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </header>
  );
}
