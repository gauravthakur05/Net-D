import React from "react";

export default function DiagnosisPanel({ diagnosis }) {
  if (!diagnosis) return null;

  return (
    <div className="card p-6 space-y-5 animate-fadeUp">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-muted font-mono mb-1">
          🩺 NetDoctor Diagnosis
        </p>
        <h3 className="font-display text-xl font-semibold">{diagnosis.title}</h3>
        <p className="text-ink-muted mt-2 text-sm leading-relaxed">{diagnosis.summary}</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-ink-muted font-mono mb-2">
          What we found
        </p>
        <ul className="space-y-1.5">
          {diagnosis.findings.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className={f.ok ? "text-vital-healthy" : "text-vital-critical"}>
                {f.ok ? "✓" : "✗"}
              </span>
              {f.label}
            </li>
          ))}
        </ul>
      </div>

      {diagnosis.recommendedFix.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted font-mono mb-2">
            Recommended Fix
          </p>
          <ol className="space-y-1.5 list-decimal list-inside text-sm text-ink-muted">
            {diagnosis.recommendedFix.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
