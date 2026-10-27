import React from 'react';

interface SelectFilterProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

function SelectFilter({ label, value, onChange, options, className = '' }: SelectFilterProps) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="label-mono">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-secondary/70 px-2.5 text-[12.5px] text-foreground transition-colors hover:border-border focus:border-primary focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-card text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

const TIER_OPTIONS = [
  { value: 'all', label: 'All tiers' },
  { value: 'low', label: 'Low' },
  { value: 'uncertain', label: 'Uncertain' },
  { value: 'high', label: 'High' },
];

const DECISION_OPTIONS = [
  { value: 'all', label: 'All decisions' },
  { value: 'allow', label: 'Continue' },
  { value: 'step_up', label: 'Step-up' },
  { value: 'decoy', label: 'Decoy' },
];

const REVIEW_OPTIONS = [
  { value: 'all', label: 'Any review state' },
  { value: 'unreviewed', label: 'Unreviewed' },
  { value: 'reviewed', label: 'Reviewed' },
];

export interface FilterState {
  range: string;
  tier: string;
  decision: string;
  reviewed: string;
}

interface FilterBarProps {
  value: FilterState;
  onChange: (val: FilterState) => void;
  children?: React.ReactNode;
}

export function FilterBar({ value, onChange, children }: FilterBarProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card/60 p-3">
      <SelectFilter
        label="Range"
        value={value.range}
        options={RANGE_OPTIONS}
        onChange={(range) => onChange({ ...value, range })}
      />
      <SelectFilter
        label="Tier"
        value={value.tier}
        options={TIER_OPTIONS}
        onChange={(tier) => onChange({ ...value, tier })}
      />
      <SelectFilter
        label="Decision"
        value={value.decision}
        options={DECISION_OPTIONS}
        onChange={(decision) => onChange({ ...value, decision })}
      />
      <SelectFilter
        label="Review"
        value={value.reviewed}
        options={REVIEW_OPTIONS}
        onChange={(reviewed) => onChange({ ...value, reviewed })}
      />
      {children}
    </div>
  );
}
