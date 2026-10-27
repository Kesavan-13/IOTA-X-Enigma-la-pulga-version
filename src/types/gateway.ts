export type RiskTier = 'low' | 'uncertain' | 'high';
export type Decision = 'allow' | 'step_up' | 'decoy';
export type ReviewLabel = 'unreviewed' | 'likely_legitimate' | 'suspicious' | 'inconclusive';
export type SessionStatus = 'active' | 'authenticated' | 'stepped_up' | 'in_decoy' | 'expired';
export type ResponseMode = 'monitor' | 'challenge' | 'adaptive';

export type SignalCode =
  | 'ATTEMPT_BURST'
  | 'TIMING_REGULARITY'
  | 'FAILURE_STREAK'
  | 'RETRY_PRESSURE'
  | 'NO_ADAPTATION'
  | 'IDENTIFIER_SPRAY'
  | 'ROUTE_PROBING'
  | 'REPEATED_PATTERN'
  | 'CONTINUITY_CHANGE'
  | 'INPUT_CADENCE';

export interface SignalDefinition {
  label: string;
  description: string;
  weight: number;
}

export interface SignalContribution {
  code: SignalCode;
  label: string;
  weight: number;
  intensity: number;
  contribution: number;
}

export interface GatewayEvent {
  id: string;
  sessionId: string;
  occurred_at: string;
  code: string;
  route: string;
  scoreAfter?: number;
  signal?: string;
  artifact?: { id: string; category: string };
  metadata?: Record<string, unknown>;
}

export interface DecoyAccessRecord {
  id: string;
  sessionId: string;
  occurred_at: string;
  artifact_id: string;
  artifact_category: string;
  action: string;
}

export interface DecoyIdentity {
  name: string;
  email: string;
  role: string;
  ref: string;
}

export interface SessionRecord {
  id: string;
  public_id: string;
  pseudonym: string;
  risk_score: number;
  risk_tier: RiskTier;
  decision: Decision;
  confidence: number;
  status: SessionStatus;
  channel: 'real' | 'decoy';
  policy_version: string;
  first_seen: string;
  last_seen: string;
  top_signal: string;
  attempt_count: number;
  failure_count: number;
  distinct_identifiers: number;
  route_categories: string[];
  review_label: ReviewLabel;
  review_note?: string;
  is_synthetic: boolean;
  scenario?: string;
  metadata?: {
    ua_family: string;
  };
  decoy_identity?: DecoyIdentity;
  signal_snapshot?: SignalContribution[];
}

export interface AuditEvent {
  id: string;
  occurred_at: string;
  actor_email: string;
  actor_role: string;
  action: string;
  target_ref?: string;
  change_summary?: string;
}

export interface PolicyConfig {
  mode: ResponseMode;
  policy_version: string;
  thresholds: {
    uncertain: number;
    high: number;
  };
  weights: Record<SignalCode, number>;
  delay_cap_ms: number;
  session_timeout_minutes: number;
  retention_days: number;
  input_cadence_enabled: boolean;
}

export interface HealthCheck {
  name: string;
  status: 'operational' | 'limited' | 'failing';
  detail: string;
}

export interface HealthStatus {
  checkedAt: string;
  checks: HealthCheck[];
}

export interface SettlementAccount {
  id: string;
  name: string;
  category: string;
  balance: number;
  status: string;
  opened: string;
  ref: string;
}

export interface SettlementTransaction {
  id: string;
  date: string;
  counterparty: string;
  amount: number;
  direction: 'in' | 'out';
  reference: string;
  status: string;
}

export interface ActivityItem {
  at: string;
  text: string;
}

export interface ProtectedAppDataset {
  org: string;
  plan: string;
  stats: Array<{ label: string; value: string; hint: string }>;
  accounts: SettlementAccount[];
  transactions: SettlementTransaction[];
  activity: ActivityItem[];
  variation?: {
    tone: string;
    message: string;
  };
}
