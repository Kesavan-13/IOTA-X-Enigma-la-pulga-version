import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, TriangleAlert, FileText, BadgeCheck } from 'lucide-react';
import { DECOY_WORKSPACE_DATA, REAL_WORKSPACE_DATA, DEMO_ACCOUNTS, SYNTHETIC_IDENTITIES } from '../lib/mockData';
import { gatewayStore } from '../lib/store';
import { formatCurrencyGBP } from '../lib/utils';
import { ProtectedAppDataset, SettlementAccount, SettlementTransaction } from '../types/gateway';
import { AcidSquares } from '../components/AcidSquares';

export function ProtectedAppWorkspacePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [selectedRecord, setSelectedRecord] = useState<{
    category: string;
    record: Record<string, any>;
  } | null>(null);

  const publicId = token ? token.replace('token_', '') : null;
  const sessionInfo = publicId ? gatewayStore.getSession(publicId) : null;

  const isDecoy = sessionInfo?.session?.channel === 'decoy';
  const dataset: ProtectedAppDataset = isDecoy ? DECOY_WORKSPACE_DATA : REAL_WORKSPACE_DATA;

  const identity = isDecoy
    ? sessionInfo?.session?.decoy_identity || SYNTHETIC_IDENTITIES[0]
    : DEMO_ACCOUNTS[0];

  // Instrument initial view of dashboard
  useEffect(() => {
    if (token) {
      gatewayStore.recordDecoyAccess(token, 'dashboard', 'page', 'view');
    }
  }, [token]);

  const handleOpenArtifact = (category: string, item: SettlementAccount | SettlementTransaction) => {
    setSelectedRecord({ category, record: item });
    if (token) {
      gatewayStore.recordDecoyAccess(token, item.id, category, 'open');
    }
  };

  if (!token || !sessionInfo) {
    return (
      <div className="relative grid min-h-screen place-items-center px-4 bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-[radial-gradient(65%_60%_at_50%_0%,hsl(var(--primary)/0.10),transparent_70%)]" />
        <div className="relative z-10 panel max-w-md p-6 text-center shadow-xl">
          <p className="text-[14px] font-semibold">Session unavailable</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
            This session has not completed sign-in or is no longer valid. Start again from the portal.
          </p>
          <Link
            to="/protected-app"
            className="mt-4 inline-block rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground hover:opacity-90"
          >
            Back to sign-in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#120f17] text-foreground">
      {/* Background ambient AcidSquares */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25">
        <AcidSquares
          color="#120f17"
          accentColor="#ff4fb8"
          secondaryColor="#3b6bff"
          tileSize={1}
          gap={0.12}
          roundness={0.25}
          rotation={35}
          waves={1}
          pulse={1}
          lighting="split"
          tilt={0.7}
          grain={0.12}
          intro={false}
          mouseInteraction={true}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-[radial-gradient(65%_60%_at_50%_0%,rgba(255,79,184,0.12),transparent_70%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Header */}
        <header className="border-b border-border/60 bg-background/85 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-[12px] font-semibold text-primary">
              M
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-tight tracking-tight">
                Meridian Freight Cooperative
              </p>
              <p className="label-mono">{dataset.plan}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[12px] font-medium leading-tight">{identity.name}</p>
              <p className="label-mono">{identity.role}</p>
            </div>
            <Link
              to="/protected-app"
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-mono">Workspace</p>
            <h1 className="mt-1 text-[24px] font-semibold tracking-tight">
              Settlement overview
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-border px-2 py-1 font-mono text-[10.5px] text-muted-foreground">
              session {publicId}
            </span>
            {isDecoy ? (
              <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10.5px] text-violet-300 font-medium">
                Decoy sandbox
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-md border border-teal-500/30 bg-teal-500/10 px-2 py-1 text-[10.5px] text-teal-300 font-medium">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Warning Variation Banner if present */}
        {dataset.variation?.message ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[12px] text-amber-200">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            <span>{dataset.variation.message}</span>
          </div>
        ) : null}

        {/* 3 KPI Stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {dataset.stats.map((st) => (
            <div key={st.label} className="panel p-4">
              <p className="label-mono">{st.label}</p>
              <p className="mt-2 text-[22px] font-semibold leading-none tracking-tight num">
                {st.value}
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{st.hint}</p>
            </div>
          ))}
        </div>

        {/* Accounts & Activity Section */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Accounts */}
          <section className="panel p-4">
            <p className="label-mono">Carrier settlement accounts</p>
            <ul className="mt-3 divide-y divide-border/60">
              {dataset.accounts.map((acct) => (
                <li
                  key={acct.id}
                  onClick={() => handleOpenArtifact('account', acct)}
                  className="flex cursor-pointer items-center justify-between gap-3 py-2.5 transition-colors hover:bg-accent/40 px-2 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium">{acct.name}</p>
                    <p className="label-mono font-mono text-[10.5px]">
                      {acct.ref} · {acct.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12.5px] font-semibold num">
                      {formatCurrencyGBP(acct.balance)}
                    </p>
                    <span className="label-mono">{acct.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Activity */}
          <section className="panel p-4">
            <p className="label-mono">Activity</p>
            <ul className="mt-3 space-y-3">
              {dataset.activity.map((act, i) => (
                <li key={i} className="flex gap-2.5">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[12px] leading-snug">{act.text}</p>
                    <p className="label-mono mt-0.5">{act.at.slice(0, 16).replace('T', ' ')} UTC</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Recent Transactions Table */}
        <section className="panel mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <p className="label-mono">Recent settlements</p>
            <p className="label-mono">{dataset.transactions.length} records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border/70 text-muted-foreground">
                  <th className="label-mono px-4 py-2 font-medium">Reference</th>
                  <th className="label-mono px-4 py-2 font-medium">Counterparty</th>
                  <th className="label-mono px-4 py-2 font-medium">Date</th>
                  <th className="label-mono px-4 py-2 text-right font-medium">Amount</th>
                  <th className="label-mono px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {dataset.transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => handleOpenArtifact('transaction', tx)}
                    className="cursor-pointer transition-colors hover:bg-accent/40"
                  >
                    <td className="px-4 py-2.5 font-mono text-[11px] text-primary">
                      {tx.reference}
                    </td>
                    <td className="px-4 py-2.5 text-[12px]">{tx.counterparty}</td>
                    <td className="px-4 py-2.5 text-[11.5px] text-muted-foreground num">
                      {tx.date}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right text-[12px] num font-medium ${
                        tx.direction === 'in' ? 'text-teal-300' : ''
                      }`}
                    >
                      {tx.direction === 'in' ? '+' : '−'}
                      {formatCurrencyGBP(tx.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-[11.5px] text-muted-foreground">
                      {tx.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Selected Record Modal / Drawer */}
        {selectedRecord ? (
          <section className="panel mt-6 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label-mono">{selectedRecord.category} record details</p>
                <p className="mt-1 text-[14px] font-semibold">
                  {selectedRecord.record.name ||
                    selectedRecord.record.reference ||
                    selectedRecord.record.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {Object.entries(selectedRecord.record).map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border/70 bg-secondary/30 px-3 py-2">
                  <dt className="label-mono">{k.replace(/_/g, ' ')}</dt>
                  <dd className="mt-0.5 text-[12px]">
                    {typeof v === 'number' ? formatCurrencyGBP(v) : String(v)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* Footer Disclaimer */}
        <p className="mt-8 text-center text-[10.5px] text-muted-foreground">
          Demonstration workspace · channel {sessionInfo.session.channel} · no external production data is present.
        </p>
      </main>
      </div>
    </div>
  );
}
