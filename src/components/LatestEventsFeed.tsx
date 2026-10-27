import React from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { formatTimeAgo, eventMeta } from '../lib/utils';
import { GatewayEvent } from '../types/gateway';

interface LatestEventsFeedProps {
  events: Array<GatewayEvent & { publicId: string }>;
  compact?: boolean;
}

export function LatestEventsFeed({ events, compact = false }: LatestEventsFeedProps) {
  const displayEvents = events.slice(0, compact ? 6 : 12);

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
          <p className="label-mono">Latest gateway events</p>
        </div>
        <p className="label-mono">live telemetry</p>
      </div>

      {displayEvents.length === 0 ? (
        <p className="px-4 py-6 text-[12.5px] text-muted-foreground">
          No gateway events recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {displayEvents.map((ev, idx) => (
            <li key={ev.id || idx} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-16 shrink-0 text-[10.5px] text-muted-foreground num">
                {formatTimeAgo(ev.occurred_at)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px]">
                <span className="font-medium">
                  {eventMeta[ev.code] ?? ev.code}
                </span>
                <span className="text-muted-foreground"> · {ev.signal || ev.route}</span>
              </span>
              {ev.scoreAfter !== undefined ? (
                <span className="hidden text-[10.5px] text-muted-foreground num sm:inline">
                  score {ev.scoreAfter}
                </span>
              ) : null}
              <Link
                to={`/sessions/${ev.publicId}`}
                className="shrink-0 font-mono text-[10.5px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {ev.publicId}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
