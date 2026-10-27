import {
  Decision,
  GatewayEvent,
  PolicyConfig,
  RiskTier,
  SignalCode,
  SignalContribution,
  SignalDefinition,
} from '../types/gateway';

export const SIGNALS: Record<SignalCode, SignalDefinition> = {
  ATTEMPT_BURST: {
    label: 'Attempt burst',
    description: 'Several authentication attempts inside a one-minute window.',
    weight: 18,
  },
  TIMING_REGULARITY: {
    label: 'Metronomic timing',
    description: 'Gaps between attempts are too even for a person filling in a login form.',
    weight: 14,
  },
  FAILURE_STREAK: {
    label: 'Consecutive failures',
    description: 'Repeated failed attempts at the end of the session.',
    weight: 16,
  },
  RETRY_PRESSURE: {
    label: 'Retry pressure',
    description: 'A high total number of failed attempts across the session, even when spaced out.',
    weight: 12,
  },
  NO_ADAPTATION: {
    label: 'No adaptation after a neutral response',
    description: 'The identical request shape repeats after a deliberately neutral response.',
    weight: 12,
  },
  IDENTIFIER_SPRAY: {
    label: 'Identifier spray',
    description: 'Several distinct account identifiers attempted from one session (keyed pseudonyms only).',
    weight: 20,
  },
  ROUTE_PROBING: {
    label: 'Route probing',
    description: 'Requests for routes or parameters the protected application does not expose.',
    weight: 12,
  },
  REPEATED_PATTERN: {
    label: 'Repeated request pattern',
    description: 'The same request shape is replayed many times.',
    weight: 9,
  },
  CONTINUITY_CHANGE: {
    label: 'Session continuity change',
    description: 'The gateway session identifier was reissued mid-flow.',
    weight: 8,
  },
  INPUT_CADENCE: {
    label: 'Input cadence (opt-in)',
    description: 'Coarse, derived keystroke-cadence aggregate deviates from the demo baseline. Off by default.',
    weight: 6,
  },
};

export const DEFAULT_POLICY: PolicyConfig = {
  mode: 'adaptive',
  policy_version: 'policy-2026.10.1',
  thresholds: {
    uncertain: 25,
    high: 62,
  },
  weights: Object.fromEntries(
    Object.entries(SIGNALS).map(([k, v]) => [k as SignalCode, v.weight])
  ) as Record<SignalCode, number>,
  delay_cap_ms: 1200,
  session_timeout_minutes: 30,
  retention_days: 30,
  input_cadence_enabled: false,
};

export const MODE_OPTIONS = [
  {
    value: 'monitor' as const,
    label: 'Monitor',
    blurb: 'Score and log every session. Never challenges and never deceives.',
  },
  {
    value: 'challenge' as const,
    label: 'Challenge',
    blurb: 'Normal authentication plus the configured step-up factor for anything above low risk.',
  },
  {
    value: 'adaptive' as const,
    label: 'Adaptive',
    blurb: 'Risk policy decides: allow, step up, or serve the isolated decoy environment.',
  },
];

export function getConfidenceTier(confidence: number): 'low' | 'moderate' | 'high' {
  if (confidence < 0.45) return 'low';
  if (confidence < 0.7) return 'moderate';
  return 'high';
}

export function evaluateSessionRisk(
  events: GatewayEvent[],
  distinctIdentifiersCount: number,
  policy: PolicyConfig
): {
  score: number;
  tier: RiskTier;
  decision: Decision;
  confidence: number;
  signals: SignalContribution[];
  topSignal: string;
} {
  const signalIntensities: Record<SignalCode, number> = {
    ATTEMPT_BURST: 0,
    TIMING_REGULARITY: 0,
    FAILURE_STREAK: 0,
    RETRY_PRESSURE: 0,
    NO_ADAPTATION: 0,
    IDENTIFIER_SPRAY: 0,
    ROUTE_PROBING: 0,
    REPEATED_PATTERN: 0,
    CONTINUITY_CHANGE: 0,
    INPUT_CADENCE: 0,
  };

  const attempts = events.filter((e) => e.code.startsWith('attempt_'));
  const failureCount = attempts.filter((e) => e.code === 'attempt_failed').length;

  // 1. Failure streak
  let streak = 0;
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].code === 'attempt_failed') streak++;
    else if (events[i].code === 'attempt_passed') break;
  }
  if (streak >= 2) {
    signalIntensities.FAILURE_STREAK = Math.min(1.0, streak * 0.25);
  }

  // 2. Retry pressure
  if (failureCount >= 3) {
    signalIntensities.RETRY_PRESSURE = Math.min(1.0, (failureCount - 2) * 0.2);
  }

  // 3. Attempt burst (attempts within short window)
  if (attempts.length >= 3) {
    signalIntensities.ATTEMPT_BURST = Math.min(1.0, (attempts.length - 2) * 0.15);
  }

  // 4. Identifier spray
  if (distinctIdentifiersCount >= 2) {
    signalIntensities.IDENTIFIER_SPRAY = Math.min(1.0, distinctIdentifiersCount * 0.35);
  }

  // 5. Route probing
  const probeEvents = events.filter((e) => e.code === 'route_probe');
  if (probeEvents.length > 0) {
    signalIntensities.ROUTE_PROBING = Math.min(1.0, probeEvents.length * 0.45);
  }

  // 6. Continuity change
  const continuityEvents = events.filter((e) => e.code === 'session_reset');
  if (continuityEvents.length > 0) {
    signalIntensities.CONTINUITY_CHANGE = 0.85;
  }

  // 7. Timing regularity & repeated pattern
  if (attempts.length >= 4) {
    signalIntensities.TIMING_REGULARITY = 0.75;
    signalIntensities.REPEATED_PATTERN = 0.6;
    signalIntensities.NO_ADAPTATION = 0.65;
  }

  const contributions: SignalContribution[] = Object.entries(SIGNALS).map(([key, def]) => {
    const code = key as SignalCode;
    const weight = policy.weights[code] ?? def.weight;
    const intensity = signalIntensities[code] ?? 0;
    const contribution = Math.round(weight * intensity);
    return {
      code,
      label: def.label,
      weight,
      intensity,
      contribution,
    };
  });

  const totalRawScore = contributions.reduce((acc, c) => acc + c.contribution, 0);
  const score = Math.max(0, Math.min(100, totalRawScore));

  let tier: RiskTier = 'low';
  if (score >= policy.thresholds.high) {
    tier = 'high';
  } else if (score >= policy.thresholds.uncertain) {
    tier = 'uncertain';
  }

  // Strong signals count
  const strongSignalsCount = contributions.filter((c) => c.intensity >= 0.5 && c.contribution >= 6).length;

  let decision: Decision = 'allow';
  if (policy.mode === 'monitor') {
    decision = 'allow';
  } else if (policy.mode === 'challenge') {
    decision = score >= policy.thresholds.uncertain ? 'step_up' : 'allow';
  } else {
    // adaptive mode: requires >= high threshold AND at least two independent strong signals
    if (score >= policy.thresholds.high && strongSignalsCount >= 2) {
      decision = 'decoy';
    } else if (score >= policy.thresholds.uncertain) {
      decision = 'step_up';
    } else {
      decision = 'allow';
    }
  }

  // Confidence calculation
  const totalRelevantSignals = contributions.filter((c) => c.contribution > 0).length;
  const eventFactor = Math.min(1.0, events.length / 8);
  const signalFactor = Math.min(1.0, totalRelevantSignals / 4);
  const confidence = Math.round((0.3 + 0.4 * eventFactor + 0.3 * signalFactor) * 100) / 100;

  // Top signal
  const sorted = [...contributions].sort((a, b) => b.contribution - a.contribution);
  const topSignal = sorted[0]?.contribution > 0 ? sorted[0].label : 'Normal interactive behavior';

  return {
    score,
    tier,
    decision,
    confidence,
    signals: contributions,
    topSignal,
  };
}
