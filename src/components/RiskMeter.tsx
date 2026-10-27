import React from 'react';
import { RiskTier, SignalContribution } from '../types/gateway';
import { getConfidenceTier } from '../lib/engine';
import { tierMeta } from '../lib/utils';

interface RiskMeterProps {
  score: number;
  tier: RiskTier;
  thresholds: {
    uncertain: number;
    high: number;
  };
  confidence: number;
}

export function RiskMeter({ score, tier, thresholds, confidence }: RiskMeterProps) {
  const meta = tierMeta[tier] ?? tierMeta.low;
  const confTier = getConfidenceTier(confidence);

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <p className="label-mono">Risk score</p>
        <div className="flex items-center gap-2">
          <span className="label-mono">Confidence:</span>
          <span className="text-[11px] font-medium text-foreground capitalize">
            {confTier} ({Math.round(confidence * 100)}%)
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-[36px] font-bold tracking-tight num ${meta.text}`}>
          {score}
        </span>
        <span className="text-[13px] text-muted-foreground">/ 100</span>
      </div>

      {/* Threshold Progress Bar */}
      <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary">
        {/* Fill */}
        <div
          className={`h-full transition-all duration-500 ${
            tier === 'high'
              ? 'bg-orange-500'
              : tier === 'uncertain'
              ? 'bg-amber-500'
              : 'bg-teal-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(3, score))}%` }}
        />

        {/* Step-up threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-border z-10"
          style={{ left: `${thresholds.uncertain}%` }}
          title={`Step-up threshold: ${thresholds.uncertain}`}
        />

        {/* Decoy threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-border z-10"
          style={{ left: `${thresholds.high}%` }}
          title={`Decoy threshold: ${thresholds.high}`}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10.5px] text-muted-foreground num">
        <span>0 (Low)</span>
        <span>{thresholds.uncertain} (Step-up)</span>
        <span>{thresholds.high} (Decoy)</span>
        <span>100</span>
      </div>
    </div>
  );
}

export function SignalContributionsTable({ signals }: { signals: SignalContribution[] }) {
  if (!signals || signals.length === 0) return null;

  const sorted = [...signals].sort((a, b) => b.contribution - a.contribution);

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-border/70 px-4 py-3">
        <p className="label-mono">Observed threat signals</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Contribution = weight × intensity. A single signal alone cannot route a session to the decoy.
        </p>
      </div>

      <div className="divide-y divide-border/60">
        {sorted.map((sig) => {
          const isTriggered = sig.contribution > 0;
          return (
            <div
              key={sig.code}
              className={`flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between ${
                isTriggered ? 'bg-secondary/20' : 'opacity-60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium leading-tight">
                  {sig.label}
                </p>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  weight {sig.weight} × intensity {(sig.intensity).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:w-48">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${
                      sig.contribution >= 10
                        ? 'bg-orange-400'
                        : sig.contribution >= 5
                        ? 'bg-amber-400'
                        : 'bg-primary/50'
                    }`}
                    style={{ width: `${Math.min(100, (sig.contribution / 20) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[11.5px] font-semibold num">
                  +{sig.contribution}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
