import React, { useState, useEffect } from 'react';
import { Download, Trash2, ShieldOff } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/Toast';
import { gatewayStore } from '../lib/store';
import { formatDateUTC } from '../lib/utils';
import { HealthStatus, PolicyConfig } from '../types/gateway';

interface SettingInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (val: number) => void;
  hint?: string;
}

function SettingInput({ label, value, min, max, unit, onChange, hint }: SettingInputProps) {
  return (
    <label className="block">
      <span className="label-mono">{label}</span>
      <span className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-9 w-24 rounded-lg border border-border bg-secondary/60 px-2.5 text-[12.5px] num focus:border-primary focus:outline-none"
        />
        <span className="text-[11px] text-muted-foreground">{unit}</span>
      </span>
      {hint ? (
        <span className="mt-1 block text-[10.5px] leading-relaxed text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const HEALTH_COLORS = {
  operational: 'text-teal-300 border-teal-500/30 bg-teal-500/10',
  limited: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  failing: 'text-orange-300 border-orange-500/30 bg-orange-500/10',
};

export function SettingsPage() {
  const [policy, setPolicy] = useState<PolicyConfig>(gatewayStore.getPolicy());
  const [delayCap, setDelayCap] = useState(policy.delay_cap_ms);
  const [timeout, setTimeoutVal] = useState(policy.session_timeout_minutes);
  const [retention, setRetention] = useState(policy.retention_days);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [health, setHealth] = useState<HealthStatus>(gatewayStore.getHealth());
  const toast = useToast();

  useEffect(() => {
    return gatewayStore.subscribe(() => {
      const current = gatewayStore.getPolicy();
      setPolicy(current);
      setDelayCap(current.delay_cap_ms);
      setTimeoutVal(current.session_timeout_minutes);
      setRetention(current.retention_days);
      setHealth(gatewayStore.getHealth());
    });
  }, []);

  const handleSaveSettings = async () => {
    setBusy(true);
    try {
      gatewayStore.updatePolicy(
        {
          delay_cap_ms: Math.max(0, Math.min(5000, delayCap)),
          session_timeout_minutes: Math.max(5, Math.min(240, timeout)),
          retention_days: Math.max(1, Math.min(365, retention)),
        },
        'Updated operational parameters: delay cap, timeout, retention window.'
      );
      toast.success('Operational settings saved.');
    } catch {
      toast.error('These settings could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    setBusy(true);
    try {
      const exp = gatewayStore.exportTelemetry(format, '30d');
      const blob = new Blob([exp.content], {
        type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exp.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${exp.count} redacted session record(s).`);
    } catch {
      toast.error('The export could not be generated.');
    } finally {
      setBusy(false);
    }
  };

  const handleRetentionCleanup = (scope: 'expired' | 'all') => {
    setBusy(true);
    try {
      const res = gatewayStore.runRetentionCleanup(scope);
      toast.success(`Removed ${res.deleted} session(s) with their events.`);
      setConfirmDeleteAll(false);
    } catch {
      toast.error('Telemetry could not be deleted.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Govern"
        title="Settings"
        description="Operational controls, redacted exports, retention and service health. Destructive actions are written to the audit trail."
      />

      {/* Section 1: Sessions & decoy pacing */}
      <section className="panel p-4">
        <p className="label-mono">Sessions & decoy pacing</p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          The delay cap is a hard ceiling applied only to decoy responses, with deterministic per-session variation. Ordinary low-risk sessions are never delayed.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <SettingInput
            label="Decoy delay cap"
            value={delayCap}
            min={0}
            max={5000}
            unit="ms"
            onChange={setDelayCap}
            hint="0 disables pacing entirely."
          />
          <SettingInput
            label="Session timeout"
            value={timeout}
            min={5}
            max={240}
            unit="minutes"
            onChange={setTimeoutVal}
          />
          <SettingInput
            label="Retention"
            value={retention}
            min={1}
            max={365}
            unit="days"
            onChange={setRetention}
            hint="Applied by the cleanup job and by the manual action below."
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={handleSaveSettings}
            className="rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Save settings
          </button>
          <p className="text-[10.5px] text-muted-foreground">
            Input-cadence collection is not configured in this deployment, so that optional signal stays inactive and off.
          </p>
        </div>
      </section>

      {/* Section 2: Redacted exports */}
      <section className="panel p-4">
        <p className="label-mono">Redacted exports</p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          Session metadata only — references, scores, tiers, decisions and review labels. No credentials, secrets or request bodies. Every export writes an audit event.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </section>

      {/* Section 3: Retention & deletion */}
      <section className="panel p-4">
        <p className="label-mono">Retention & deletion</p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          Cleanup removes sessions whose last activity is older than the retention window, together with their events and decoy access records. Deletion is immediate and audited.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleRetentionCleanup('expired')}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Run retention cleanup</span>
          </button>

          {confirmDeleteAll ? (
            <span className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleRetentionCleanup('all')}
                className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-[12px] font-semibold text-orange-300 hover:bg-orange-500/20 transition-colors"
              >
                Confirm: delete all telemetry
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteAll(false)}
                className="text-[11.5px] text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDeleteAll(true)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <ShieldOff className="h-3.5 w-3.5" />
              <span>Delete all telemetry</span>
            </button>
          )}
        </div>
      </section>

      {/* Section 4: Service health */}
      <section className="panel p-4">
        <p className="label-mono">Service health</p>
        <div className="mt-3 space-y-2">
          {health.checks.map((c) => (
            <div
              key={c.name}
              className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5"
            >
              <span
                className={`mt-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  HEALTH_COLORS[c.status] || HEALTH_COLORS.limited
                }`}
              >
                {c.status}
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium">{c.name}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {c.detail}
                </p>
              </div>
            </div>
          ))}
          <p className="text-[10.5px] text-muted-foreground pt-1">
            Checked {formatDateUTC(health.checkedAt)} UTC
          </p>
        </div>
      </section>
    </div>
  );
}
