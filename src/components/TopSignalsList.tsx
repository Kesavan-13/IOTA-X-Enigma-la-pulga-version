import React from 'react';

export interface SignalFrequency {
  code: string;
  label: string;
  sessions: number;
}

export function TopSignalsList({ signals }: { signals: SignalFrequency[] }) {
  if (!signals || signals.length === 0) return null;

  const maxVal = Math.max(...signals.map((s) => s.sessions), 1);

  return (
    <div className="panel p-4">
      <p className="label-mono">Most frequent signals</p>
      <ul className="mt-3 space-y-3">
        {signals.map((sig) => (
          <li key={sig.code}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] font-medium">{sig.label}</span>
              <span className="text-[11px] text-muted-foreground num">
                {sig.sessions} sessions
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${Math.round((sig.sessions / maxVal) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
