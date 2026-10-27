import React from 'react';
import { GatewayEvent } from '../types/gateway';
import { eventColorMeta, eventMeta, formatDateUTC } from '../lib/utils';
import { CircleDot } from 'lucide-react';

export function EventTimeline({ events }: { events: GatewayEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-[12.5px] text-muted-foreground">
        No events recorded for this session.
      </div>
    );
  }

  return (
    <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/70">
      <div className="space-y-4">
        {events.map((ev, index) => {
          const colorClass = eventColorMeta[ev.code] ?? 'text-foreground';
          const label = eventMeta[ev.code] ?? ev.code;

          return (
            <div key={ev.id || index} className="relative flex items-start gap-3">
              <span className="absolute -left-6 top-1 grid h-4 w-4 place-items-center rounded-full bg-background">
                <CircleDot className={`h-3.5 w-3.5 ${colorClass}`} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className={`text-[12.5px] font-medium ${colorClass}`}>
                    {label}
                  </span>
                  <span className="label-mono">route: {ev.route}</span>
                  {ev.artifact ? (
                    <span className="font-mono text-[10.5px] text-muted-foreground">
                      [{ev.artifact.category}: {ev.artifact.id}]
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground num">
                  {formatDateUTC(ev.occurred_at)} UTC
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
