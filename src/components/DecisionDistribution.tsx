import React from 'react';

interface Totals {
  sessions: number;
  low: number;
  uncertain: number;
  high: number;
  authenticated: number;
  steppedUp: number;
  inDecoy: number;
}

export function DecisionDistribution({ totals }: { totals: Totals }) {
  const items = [
    { key: 'low', label: 'Low', value: totals.low, tone: 'bg-teal-400' },
    { key: 'uncertain', label: 'Uncertain', value: totals.uncertain, tone: 'bg-amber-400' },
    { key: 'high', label: 'High', value: totals.high, tone: 'bg-orange-400' },
  ];

  const total = Math.max(1, totals.sessions);

  return (
    <div className="panel p-4 flex flex-col justify-between">
      <div>
        <p className="label-mono">Decision distribution</p>
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.key}>
              <div className="flex items-baseline justify-between">
                <span className="text-[12.5px] font-medium">{item.label}</span>
                <span className="text-[11px] text-muted-foreground num">
                  {item.value} · {Math.round((item.value / total) * 100)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${item.tone}`}
                  style={{ width: `${Math.max(2, (item.value / total) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-3 text-center">
        <div>
          <p className="text-[15px] font-semibold num">{totals.authenticated}</p>
          <p className="label-mono mt-0.5">Completed</p>
        </div>
        <div>
          <p className="text-[15px] font-semibold num">{totals.steppedUp}</p>
          <p className="label-mono mt-0.5">Step-up</p>
        </div>
        <div>
          <p className="text-[15px] font-semibold num text-orange-300">{totals.inDecoy}</p>
          <p className="label-mono mt-0.5">In Decoy</p>
        </div>
      </div>
    </div>
  );
}
