import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { gatewayStore } from '../lib/store';
import { formatDateUTC } from '../lib/utils';
import { AuditEvent } from '../types/gateway';

export function AuditPage() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() =>
    gatewayStore.getAuditEvents(150)
  );

  useEffect(() => {
    return gatewayStore.subscribe(() => {
      setAuditEvents(gatewayStore.getAuditEvents(150));
    });
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Govern"
        title="Audit trail"
        description="Append-only record of operator sign-ins, policy changes, review labels, exports and destructive data actions. Summaries are redacted and never contain credentials."
      />

      {auditEvents.length > 0 ? (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead>
                <tr className="border-b border-border/70 text-muted-foreground">
                  <th className="label-mono px-4 py-2.5 font-medium">When</th>
                  <th className="label-mono px-4 py-2.5 font-medium">Actor</th>
                  <th className="label-mono px-4 py-2.5 font-medium">Action</th>
                  <th className="label-mono px-4 py-2.5 font-medium">Target</th>
                  <th className="label-mono px-4 py-2.5 font-medium">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {auditEvents.map((ev) => (
                  <tr key={ev.id} className="align-top hover:bg-accent/30 transition-colors">
                    <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-muted-foreground num">
                      {formatDateUTC(ev.occurred_at)}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-[12px] font-medium">{ev.actor_email}</p>
                      <p className="label-mono">{ev.actor_role || '—'}</p>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-primary">
                      {ev.action}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {ev.target_ref || '—'}
                    </td>
                    <td className="max-w-[420px] px-4 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
                      <span className="line-clamp-2">{ev.change_summary || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="panel p-8 text-center">
          <p className="text-[13px] font-medium">No audit events yet.</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Policy changes, reviews and exports appear here as soon as they happen.
          </p>
        </div>
      )}
    </div>
  );
}
