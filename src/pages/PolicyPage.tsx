import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/Toast';
import { gatewayStore } from '../lib/store';
import { DEFAULT_POLICY, MODE_OPTIONS, SIGNALS } from '../lib/engine';
import { PolicyConfig, ResponseMode, SignalCode } from '../types/gateway';

const SIGNAL_KEYS = Object.keys(SIGNALS) as SignalCode[];

export function PolicyPage() {
  const [policy, setPolicy] = useState<PolicyConfig>(gatewayStore.getPolicy());
  const [mode, setMode] = useState<ResponseMode>(policy.mode);
  const [thresholds, setThresholds] = useState(policy.thresholds);
  const [weights, setWeights] = useState(policy.weights);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    return gatewayStore.subscribe(() => {
      const current = gatewayStore.getPolicy();
      setPolicy(current);
      setMode(current.mode);
      setThresholds(current.thresholds);
      setWeights(current.weights);
    });
  }, []);

  const handleThresholdChange = (key: 'uncertain' | 'high', val: number) => {
    const num = Number(val);
    setThresholds((prev) => {
      const next = { ...prev, [key]: num };
      if (key === 'uncertain') {
        next.high = Math.max(next.high, Math.min(100, num + 5));
      }
      if (key === 'high') {
        next.uncertain = Math.min(next.uncertain, Math.max(5, num - 5));
      }
      return next;
    });
  };

  const handleWeightChange = (code: SignalCode, val: number) => {
    const clamped = Math.max(0, Math.min(40, Number(val) || 0));
    setWeights((prev) => ({ ...prev, [code]: clamped }));
  };

  const handleResetWeights = () => {
    setWeights({ ...DEFAULT_POLICY.weights });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      gatewayStore.updatePolicy({
        mode,
        thresholds,
        weights,
      });
      toast.success('Policy saved with a new version.');
    } catch {
      toast.error('The policy could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Tune"
        title="Risk policy"
        description="A transparent weighted model. High risk requires at least two independent strong signals to route to the isolated decoy."
        actions={
          <span className="rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            {policy.policy_version}
          </span>
        }
      />

      {/* Safe response mode */}
      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-mono">Safe response mode</p>
            <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
              The mode is enforced server-side before any routing. Monitor never deceives; Challenge never serves a decoy; Adaptive lets the policy choose.
            </p>
          </div>
          <p className="rounded-md border border-border px-2 py-1 font-mono text-[10.5px] text-muted-foreground">
            {policy.policy_version}
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                mode === opt.value
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              <p className="text-[12.5px] font-semibold">{opt.label}</p>
              <p className="mt-1 text-[11px] leading-relaxed opacity-80">{opt.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Decision thresholds */}
      <section className="panel p-4">
        <p className="label-mono">Decision thresholds</p>
        <p className="mt-1.5 text-[11.5px] text-muted-foreground">
          A score at or above the step-up threshold asks for a stronger factor; at or above the decoy threshold the session is served the isolated synthetic environment — and only when at least two independent signals are strong.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="flex justify-between items-center mb-1">
              <span className="label-mono">Step-up at</span>
              <span className="font-mono text-[12px] font-semibold">{thresholds.uncertain}</span>
            </div>
            <input
              type="range"
              min={5}
              max={95}
              value={thresholds.uncertain}
              onChange={(e) => handleThresholdChange('uncertain', Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </label>

          <label className="block">
            <div className="flex justify-between items-center mb-1">
              <span className="label-mono">Decoy at</span>
              <span className="font-mono text-[12px] font-semibold">{thresholds.high}</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={thresholds.high}
              onChange={(e) => handleThresholdChange('high', Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </label>
        </div>
      </section>

      {/* Signal weights */}
      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div>
            <p className="label-mono">Signal weights</p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Contribution = weight × intensity (0–1). One signal alone can never reach the decoy tier.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetWeights}
            className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset weights
          </button>
        </div>

        <ul className="divide-y divide-border/60">
          {SIGNAL_KEYS.map((code) => {
            const def = SIGNALS[code];
            const weight = Number(weights[code] ?? def.weight);

            return (
              <li key={code} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium">{def.label}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {def.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:w-[220px]">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all"
                      style={{ width: `${(weight / 40) * 100}%` }}
                    />
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={weight}
                    onChange={(e) => handleWeightChange(code, Number(e.target.value))}
                    aria-label={`${def.label} weight`}
                    className="h-8 w-16 rounded-md border border-border bg-secondary/60 px-2 text-right text-[12px] num focus:border-primary focus:outline-none"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Saving policy…' : 'Save policy'}
        </button>
        <span className="text-[11px] text-muted-foreground">
          Saving updates the version string and logs an append-only audit event.
        </span>
      </div>
    </div>
  );
}
