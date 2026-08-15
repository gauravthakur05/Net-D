import React from "react";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No events yet. Start monitoring to build a timeline of what happened.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-border ml-2 space-y-5">
      {events.map((e, i) => (
        <li key={i} className="ml-4">
          <span className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-vital-healthy" />
          <p className="font-mono text-xs text-ink-muted">{formatTime(e.time)}</p>
          <p className="text-sm">{e.label}</p>
        </li>
      ))}
    </ol>
  );
}
