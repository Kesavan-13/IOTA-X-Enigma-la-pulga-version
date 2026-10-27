import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface TrendDataPoint {
  date: string;
  low: number;
  uncertain: number;
  high: number;
}

const SERIE_CONFIG = [
  { key: 'low', label: 'Low risk', color: '#14b8a6' },
  { key: 'uncertain', label: 'Uncertain', color: '#f59e0b' },
  { key: 'high', label: 'High risk', color: '#f97316' },
];

export function TrendChart({ data }: { data: TrendDataPoint[] }) {
  return (
    <div className="panel p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="label-mono">Risk mix over time</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Sessions entering the gateway, by first-seen day (UTC).
          </p>
        </div>
        <div className="flex items-center gap-3">
          {SERIE_CONFIG.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: -22 }}>
            <defs>
              {SERIE_CONFIG.map((s) => (
                <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => String(d).slice(5)}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={38}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-card p-2.5 shadow-md">
                      <p className="font-mono text-[10px] text-muted-foreground mb-1.5">{label}</p>
                      {payload.map((entry) => (
                        <div key={entry.name} className="flex items-center justify-between gap-4 text-[11.5px]">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
                            <span className="capitalize">{entry.name}:</span>
                          </span>
                          <span className="font-mono font-semibold">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#14b8a6"
              fill="url(#fill-low)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="uncertain"
              stroke="#f59e0b"
              fill="url(#fill-uncertain)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="#f97316"
              fill="url(#fill-high)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
