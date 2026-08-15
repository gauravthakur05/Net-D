import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WebsiteChecker from "./pages/WebsiteChecker.jsx";
import History from "./pages/History.jsx";

export default function App() {
  const [isDemo, setIsDemo] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("light-mode", isLight);
  }, [isLight]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isDemo={isDemo}
        onToggleDemo={() => setIsDemo((v) => !v)}
        isLight={isLight}
        onToggleTheme={() => setIsLight((v) => !v)}
      />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing isDemo={isDemo} />} />
          <Route path="/dashboard" element={<Dashboard isDemo={isDemo} />} />
          <Route path="/website-checker" element={<WebsiteChecker isDemo={isDemo} />} />
          <Route path="/history" element={<History isDemo={isDemo} />} />
        </Routes>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-ink-muted font-mono">
        NetDoctor doesn't store browsing history or personal data — only diagnostic results.
      </footer>
    </div>
  );
}
