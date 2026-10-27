import React from 'react';
import { Eye, TriangleAlert } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DECOY_WORKSPACE_DATA, SYNTHETIC_IDENTITIES } from '../lib/mockData';
import { formatCurrencyGBP } from '../lib/utils';

export function DecoyPreviewPage() {
  const data = DECOY_WORKSPACE_DATA;

  return (
    <div>
      <PageHeader
        eyebrow="Operate"
        title="Decoy preview"
        description="What a high-risk session is served, marked unmistakably as synthetic for operators. The decoy never contains real records and never receives a real session or token."
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2.5 text-[12px] text-violet-200">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>Operator preview · every record below is fabricated and isolated from any real workspace.</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* Left Column: Synthetic Workspace */}
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <p className="label-mono">Synthetic workspace</p>
              <span className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300">
                <Eye className="h-3 w-3" />
                <span>decoy</span>
              </span>
            </div>

            <p className="mt-2 text-[15px] font-semibold">{data.org}</p>
            {data.variation?.message ? (
              <p className="text-[11.5px] text-muted-foreground">{data.variation.message}</p>
            ) : null}

            {/* KPI Stats */}
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {data.stats.map((st) => (
                <div key={st.label} className="rounded-lg border border-border/70 bg-secondary/30 p-3">
                  <p className="label-mono">{st.label}</p>
                  <p className="mt-1 text-[16px] font-semibold num">{st.value}</p>
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">{st.hint}</p>
                </div>
              ))}
            </div>

            {/* Accounts Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-border/70 text-muted-foreground">
                    <th className="label-mono px-2 py-2 font-medium">Account</th>
                    <th className="label-mono px-2 py-2 font-medium">Category</th>
                    <th className="label-mono px-2 py-2 text-right font-medium">Balance</th>
                    <th className="label-mono px-2 py-2 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.accounts.map((acct) => (
                    <tr key={acct.id}>
                      <td className="px-2 py-2 text-[12px]">{acct.name}</td>
                      <td className="px-2 py-2 text-[11.5px] text-muted-foreground">{acct.category}</td>
                      <td className="px-2 py-2 text-right text-[12px] num font-medium">
                        {formatCurrencyGBP(acct.balance)}
                      </td>
                      <td className="px-2 py-2 font-mono text-[10.5px] text-muted-foreground">
                        {acct.ref}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stable Synthetic Identities */}
          <div className="panel overflow-hidden">
            <div className="border-b border-border/70 px-4 py-3">
              <p className="label-mono">Stable synthetic identities</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Each decoy session is assigned one identity deterministically, so the experience stays consistent across pages.
              </p>
            </div>
            <ul className="divide-y divide-border/60">
              {SYNTHETIC_IDENTITIES.map((ident) => (
                <li key={ident.ref} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-[12px] font-medium">{ident.name}</p>
                    <p className="label-mono">{ident.role}</p>
                  </div>
                  <span className="font-mono text-[10.5px] text-muted-foreground">{ident.ref}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Explanations & Guarantees */}
        <div className="space-y-4">
          <div className="panel p-4">
            <p className="label-mono">What gets instrumented</p>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-muted-foreground">
              <li>Page and record categories opened, with timestamps.</li>
              <li>Repeated paths and repeated record opens.</li>
              <li>Response class served and the deterministic delay applied.</li>
              <li>Session reference and synthetic identity reference.</li>
            </ul>
            <p className="mt-3 border-t border-border/70 pt-3 text-[10.5px] leading-relaxed text-muted-foreground">
              Not recorded: record contents, form input, clipboard, keystrokes, credentials or anything outside this synthetic workspace.
            </p>
          </div>

          <div className="panel p-4">
            <p className="label-mono">Isolation guarantees</p>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-muted-foreground">
              <li>A decoy session holds only an opaque gateway handle, never a real account session.</li>
              <li>The decoy dataset is a separate module; the real adapter is never consulted for a decoy session.</li>
              <li>Recovery requires the account's strong recovery factor, not a repeated password.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
