import React from 'react';
import { Decision, ReviewLabel, RiskTier } from '../types/gateway';
import { decisionMeta, reviewMeta, tierMeta } from '../lib/utils';

export function BaseChip({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function RiskTierChip({ tier, score }: { tier: RiskTier; score?: number }) {
  const meta = tierMeta[tier] ?? tierMeta.low;
  return (
    <BaseChip className={meta.chip}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
      {typeof score === 'number' ? <span className="num opacity-70">{score}</span> : null}
    </BaseChip>
  );
}

export function DecisionChip({ decision }: { decision: Decision }) {
  const meta = decisionMeta[decision] ?? decisionMeta.allow;
  return <BaseChip className={meta.chip}>{meta.label}</BaseChip>;
}

export function ReviewStatusChip({ label }: { label: ReviewLabel }) {
  const meta = reviewMeta[label] ?? reviewMeta.unreviewed;
  return <BaseChip className={meta.chip}>{meta.label}</BaseChip>;
}

export function SyntheticChip() {
  return (
    <BaseChip className="border-violet-500/30 bg-violet-500/10 text-violet-300">
      Synthetic
    </BaseChip>
  );
}
