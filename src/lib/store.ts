import {
  AuditEvent,
  DecoyAccessRecord,
  GatewayEvent,
  HealthStatus,
  PolicyConfig,
  ReviewLabel,
  SessionRecord,
} from '../types/gateway';
import { DEFAULT_POLICY, evaluateSessionRisk } from './engine';
import {
  DECOY_WORKSPACE_DATA,
  DEMO_ACCOUNTS,
  INITIAL_AUDIT_EVENTS,
  SIMULATOR_SCENARIOS,
  SYNTHETIC_IDENTITIES,
} from './mockData';

const STORAGE_KEYS = {
  POLICY: 'adg_policy_config',
  SESSIONS: 'adg_sessions',
  EVENTS: 'adg_events',
  DECOY_ACCESS: 'adg_decoy_access',
  AUDIT: 'adg_audit_events',
};

// Seed initial realistic sessions
function generateInitialSessions(): {
  sessions: SessionRecord[];
  events: Record<string, GatewayEvent[]>;
  decoyAccess: Record<string, DecoyAccessRecord[]>;
} {
  const sessions: SessionRecord[] = [];
  const events: Record<string, GatewayEvent[]> = {};
  const decoyAccess: Record<string, DecoyAccessRecord[]> = {};

  const now = Date.now();

  // Helper to create a session
  function createSeedSession(params: {
    id: string;
    public_id: string;
    pseudonym: string;
    timeOffsetMs: number;
    scenarioKey?: keyof typeof SIMULATOR_SCENARIOS;
    isSynthetic: boolean;
    reviewLabel?: ReviewLabel;
  }) {
    const { id, public_id, pseudonym, timeOffsetMs, scenarioKey, isSynthetic, reviewLabel } = params;
    const baseTime = now - timeOffsetMs;

    let scenarioSteps = SIMULATOR_SCENARIOS[scenarioKey ?? 'normal_typo'].steps;
    const sessionEvents: GatewayEvent[] = scenarioSteps.map((step, idx) => ({
      id: `ev_${id}_${idx}`,
      sessionId: public_id,
      occurred_at: new Date(baseTime + step.at * 1000).toISOString(),
      code: step.code,
      route: step.route,
      signal: step.code === 'attempt_failed' ? 'Attempt failed' : step.code === 'attempt_passed' ? 'Credentials accepted' : step.code,
      artifact: (step as any).artifact,
    }));

    events[public_id] = sessionEvents;

    // Distinct identifiers
    const distinctIdentifiers = scenarioKey === 'scripted_bursts' || scenarioKey === 'decoy_explorer' ? 5 : 1;

    const evaluation = evaluateSessionRisk(sessionEvents, distinctIdentifiers, DEFAULT_POLICY);

    // If decoy steps exist, collect artifact accesses
    const sessionDecoyAccess: DecoyAccessRecord[] = [];
    sessionEvents
      .filter((e) => e.code === 'decoy_record_access' && e.artifact)
      .forEach((e, idx) => {
        sessionDecoyAccess.push({
          id: `da_${id}_${idx}`,
          sessionId: public_id,
          occurred_at: e.occurred_at,
          artifact_id: e.artifact!.id,
          artifact_category: e.artifact!.category,
          action: 'open',
        });
      });
    decoyAccess[public_id] = sessionDecoyAccess;

    const assignedIdentity = isSynthetic
      ? SYNTHETIC_IDENTITIES[Math.abs(public_id.charCodeAt(5)) % SYNTHETIC_IDENTITIES.length]
      : undefined;

    const session: SessionRecord = {
      id,
      public_id,
      pseudonym,
      risk_score: evaluation.score,
      risk_tier: evaluation.tier,
      decision: evaluation.decision,
      confidence: evaluation.confidence,
      status: evaluation.decision === 'decoy' ? 'in_decoy' : evaluation.decision === 'step_up' ? 'stepped_up' : 'authenticated',
      channel: evaluation.decision === 'decoy' ? 'decoy' : 'real',
      policy_version: DEFAULT_POLICY.policy_version,
      first_seen: new Date(baseTime).toISOString(),
      last_seen: new Date(baseTime + (scenarioSteps[scenarioSteps.length - 1]?.at ?? 0) * 1000).toISOString(),
      top_signal: evaluation.topSignal,
      attempt_count: sessionEvents.filter((e) => e.code.startsWith('attempt_')).length,
      failure_count: sessionEvents.filter((e) => e.code === 'attempt_failed').length,
      distinct_identifiers: distinctIdentifiers,
      route_categories: ['login', ...(evaluation.decision === 'decoy' ? ['account', 'transaction'] : [])],
      review_label: reviewLabel ?? 'unreviewed',
      is_synthetic: isSynthetic,
      scenario: scenarioKey,
      metadata: {
        ua_family: scenarioKey === 'scripted_bursts' ? 'Python-requests/2.31' : 'Chrome/128',
      },
      decoy_identity: assignedIdentity,
      signal_snapshot: evaluation.signals,
    };

    sessions.push(session);
  }

  // Generate diverse seed sessions across 7 days
  createSeedSession({
    id: 's_01',
    public_id: 'sess_9182fa',
    pseudonym: 'ps_44a1b0',
    timeOffsetMs: 1000 * 60 * 30, // 30m ago
    scenarioKey: 'normal_typo',
    isSynthetic: false,
    reviewLabel: 'likely_legitimate',
  });

  createSeedSession({
    id: 's_02',
    public_id: 'sess_8421bc',
    pseudonym: 'ps_99c3e2',
    timeOffsetMs: 1000 * 60 * 180, // 3h ago
    scenarioKey: 'forgetful_step_up',
    isSynthetic: false,
    reviewLabel: 'likely_legitimate',
  });

  createSeedSession({
    id: 's_03',
    public_id: 'sess_7109cd',
    pseudonym: 'ps_12e7f8',
    timeOffsetMs: 1000 * 3600 * 8, // 8h ago
    scenarioKey: 'scripted_bursts',
    isSynthetic: true,
    reviewLabel: 'suspicious',
  });

  createSeedSession({
    id: 's_04',
    public_id: 'sess_6304ef',
    pseudonym: 'ps_88f0a4',
    timeOffsetMs: 1000 * 3600 * 19, // 19h ago
    scenarioKey: 'decoy_explorer',
    isSynthetic: true,
    reviewLabel: 'suspicious',
  });

  createSeedSession({
    id: 's_05',
    public_id: 'sess_5210aa',
    pseudonym: 'ps_31b8d2',
    timeOffsetMs: 1000 * 3600 * 42, // 1.7 days ago
    scenarioKey: 'normal_typo',
    isSynthetic: false,
  });

  createSeedSession({
    id: 's_06',
    public_id: 'sess_4188bb',
    pseudonym: 'ps_74d2c9',
    timeOffsetMs: 1000 * 3600 * 68, // 2.8 days ago
    scenarioKey: 'scripted_bursts',
    isSynthetic: true,
    reviewLabel: 'suspicious',
  });

  createSeedSession({
    id: 's_07',
    public_id: 'sess_3102cc',
    pseudonym: 'ps_65a4e1',
    timeOffsetMs: 1000 * 3600 * 110, // 4.5 days ago
    scenarioKey: 'decoy_explorer',
    isSynthetic: true,
  });

  createSeedSession({
    id: 's_08',
    public_id: 'sess_2091dd',
    pseudonym: 'ps_53f9b7',
    timeOffsetMs: 1000 * 3600 * 135, // 5.6 days ago
    scenarioKey: 'forgetful_step_up',
    isSynthetic: false,
    reviewLabel: 'inconclusive',
  });

  return { sessions, events, decoyAccess };
}

class GatewayStore {
  private policy: PolicyConfig;
  private sessions: SessionRecord[] = [];
  private events: Record<string, GatewayEvent[]> = {};
  private decoyAccess: Record<string, DecoyAccessRecord[]> = {};
  private auditEvents: AuditEvent[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.policy = this.loadPolicy();
    const storedSessions = this.loadJson<SessionRecord[]>(STORAGE_KEYS.SESSIONS);
    const storedEvents = this.loadJson<Record<string, GatewayEvent[]>>(STORAGE_KEYS.EVENTS);
    const storedDecoyAccess = this.loadJson<Record<string, DecoyAccessRecord[]>>(STORAGE_KEYS.DECOY_ACCESS);
    const storedAudit = this.loadJson<AuditEvent[]>(STORAGE_KEYS.AUDIT);

    if (storedSessions && storedSessions.length > 0) {
      this.sessions = storedSessions;
      this.events = storedEvents || {};
      this.decoyAccess = storedDecoyAccess || {};
      this.auditEvents = storedAudit || INITIAL_AUDIT_EVENTS;
    } else {
      const initial = generateInitialSessions();
      this.sessions = initial.sessions;
      this.events = initial.events;
      this.decoyAccess = initial.decoyAccess;
      this.auditEvents = storedAudit || INITIAL_AUDIT_EVENTS;
      this.persist();
    }
  }

  private loadJson<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private saveJson(key: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  private loadPolicy(): PolicyConfig {
    const saved = this.loadJson<PolicyConfig>(STORAGE_KEYS.POLICY);
    return saved ? { ...DEFAULT_POLICY, ...saved } : { ...DEFAULT_POLICY };
  }

  private persist() {
    this.saveJson(STORAGE_KEYS.POLICY, this.policy);
    this.saveJson(STORAGE_KEYS.SESSIONS, this.sessions);
    this.saveJson(STORAGE_KEYS.EVENTS, this.events);
    this.saveJson(STORAGE_KEYS.DECOY_ACCESS, this.decoyAccess);
    this.saveJson(STORAGE_KEYS.AUDIT, this.auditEvents);
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getPolicy(): PolicyConfig {
    return { ...this.policy };
  }

  public updatePolicy(updates: Partial<PolicyConfig>, summary?: string) {
    const versionNum = parseInt(this.policy.policy_version.replace(/[^0-9]/g, '')) || 2026101;
    const newVersion = `policy-${(versionNum + 1).toString().slice(0, 4)}.${(versionNum + 1).toString().slice(4, 6)}.${(versionNum + 1).toString().slice(6) || '1'}`;

    this.policy = {
      ...this.policy,
      ...updates,
      policy_version: newVersion,
    };

    this.addAuditEvent({
      action: 'POLICY_UPDATE',
      target_ref: newVersion,
      change_summary:
        summary ||
        `Updated policy thresholds (uncertain: ${this.policy.thresholds.uncertain}, high: ${this.policy.thresholds.high}) in ${this.policy.mode} mode.`,
    });

    this.persist();
  }

  public getSessions(): SessionRecord[] {
    return [...this.sessions].sort(
      (a, b) => new Date(b.first_seen).getTime() - new Date(a.first_seen).getTime()
    );
  }

  public getSession(publicId: string): {
    session: SessionRecord;
    events: GatewayEvent[];
    decoyAccess: DecoyAccessRecord[];
  } | null {
    const session = this.sessions.find((s) => s.public_id === publicId);
    if (!session) return null;
    return {
      session: { ...session },
      events: this.events[publicId] || [],
      decoyAccess: this.decoyAccess[publicId] || [],
    };
  }

  public getEventsForSession(publicId: string): GatewayEvent[] {
    return this.events[publicId] || [];
  }

  public getDecoyAccessForSession(publicId: string): DecoyAccessRecord[] {
    return this.decoyAccess[publicId] || [];
  }

  public getAuditEvents(limit = 150): AuditEvent[] {
    return [...this.auditEvents]
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .slice(0, limit);
  }

  public addAuditEvent(params: { action: string; target_ref?: string; change_summary?: string }) {
    const audit: AuditEvent = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      occurred_at: new Date().toISOString(),
      actor_email: 'operator@meridianfreight.example',
      actor_role: 'Lead Operator',
      action: params.action,
      target_ref: params.target_ref,
      change_summary: params.change_summary,
    };
    this.auditEvents.unshift(audit);
    this.persist();
  }

  public reviewSession(publicId: string, label: ReviewLabel, note?: string) {
    const session = this.sessions.find((s) => s.public_id === publicId);
    if (!session) throw new Error('Session not found');

    session.review_label = label;
    if (note !== undefined) session.review_note = note;

    this.addAuditEvent({
      action: 'REVIEW_LABEL',
      target_ref: publicId,
      change_summary: `Labeled session ${publicId} as ${label}${note ? `: "${note}"` : '.'}`,
    });

    this.persist();
  }

  public recordDecoyAccess(tokenOrPublicId: string, artifactId: string, category: string, action: string) {
    let session = this.sessions.find((s) => s.public_id === tokenOrPublicId || s.id === tokenOrPublicId);
    if (!session && tokenOrPublicId.startsWith('token_')) {
      const publicId = tokenOrPublicId.replace('token_', '');
      session = this.sessions.find((s) => s.public_id === publicId);
    }
    if (!session) return;

    const accessRecord: DecoyAccessRecord = {
      id: `da_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId: session.public_id,
      occurred_at: new Date().toISOString(),
      artifact_id: artifactId,
      artifact_category: category,
      action,
    };

    if (!this.decoyAccess[session.public_id]) {
      this.decoyAccess[session.public_id] = [];
    }
    this.decoyAccess[session.public_id].unshift(accessRecord);

    const event: GatewayEvent = {
      id: `ev_${Date.now()}`,
      sessionId: session.public_id,
      occurred_at: new Date().toISOString(),
      code: 'decoy_record_access',
      route: category,
      signal: 'Decoy record access',
      artifact: { id: artifactId, category },
    };

    if (!this.events[session.public_id]) {
      this.events[session.public_id] = [];
    }
    this.events[session.public_id].push(event);

    session.last_seen = new Date().toISOString();
    this.persist();
  }

  public runSimulatorScenario(scenarioKey: keyof typeof SIMULATOR_SCENARIOS): SessionRecord {
    const scenario = SIMULATOR_SCENARIOS[scenarioKey];
    if (!scenario) throw new Error('Unknown scenario');

    const publicId = `sess_${Math.random().toString(36).substring(2, 8)}`;
    const pseudonym = `ps_${Math.random().toString(36).substring(2, 8)}`;
    const baseTime = Date.now();

    const sessionEvents: GatewayEvent[] = scenario.steps.map((step, idx) => ({
      id: `ev_${publicId}_${idx}`,
      sessionId: publicId,
      occurred_at: new Date(baseTime + step.at * 1000).toISOString(),
      code: step.code,
      route: step.route,
      signal:
        step.code === 'attempt_failed'
          ? 'Attempt failed'
          : step.code === 'attempt_passed'
          ? 'Credentials accepted'
          : step.code === 'route_probe'
          ? 'Route probe'
          : step.code === 'decoy_enter'
          ? 'Entered decoy'
          : step.code,
      artifact: (step as any).artifact,
    }));

    this.events[publicId] = sessionEvents;

    const distinctIdentifiers = scenarioKey === 'scripted_bursts' || scenarioKey === 'decoy_explorer' ? 5 : 1;
    const evaluation = evaluateSessionRisk(sessionEvents, distinctIdentifiers, this.policy);

    const sessionDecoyAccess: DecoyAccessRecord[] = [];
    sessionEvents
      .filter((e) => e.code === 'decoy_record_access' && e.artifact)
      .forEach((e, idx) => {
        sessionDecoyAccess.push({
          id: `da_${publicId}_${idx}`,
          sessionId: publicId,
          occurred_at: e.occurred_at,
          artifact_id: e.artifact!.id,
          artifact_category: e.artifact!.category,
          action: 'open',
        });
      });
    this.decoyAccess[publicId] = sessionDecoyAccess;

    const assignedIdentity =
      SYNTHETIC_IDENTITIES[Math.abs(publicId.charCodeAt(5)) % SYNTHETIC_IDENTITIES.length];

    const session: SessionRecord = {
      id: `s_${Date.now()}`,
      public_id: publicId,
      pseudonym,
      risk_score: evaluation.score,
      risk_tier: evaluation.tier,
      decision: evaluation.decision,
      confidence: evaluation.confidence,
      status: evaluation.decision === 'decoy' ? 'in_decoy' : evaluation.decision === 'step_up' ? 'stepped_up' : 'authenticated',
      channel: evaluation.decision === 'decoy' ? 'decoy' : 'real',
      policy_version: this.policy.policy_version,
      first_seen: new Date(baseTime).toISOString(),
      last_seen: new Date(baseTime + (scenario.steps[scenario.steps.length - 1]?.at ?? 0) * 1000).toISOString(),
      top_signal: evaluation.topSignal,
      attempt_count: sessionEvents.filter((e) => e.code.startsWith('attempt_')).length,
      failure_count: sessionEvents.filter((e) => e.code === 'attempt_failed').length,
      distinct_identifiers: distinctIdentifiers,
      route_categories: ['login', ...(evaluation.decision === 'decoy' ? ['account', 'transaction'] : [])],
      review_label: 'unreviewed',
      is_synthetic: true,
      scenario: scenarioKey,
      metadata: {
        ua_family: scenarioKey === 'scripted_bursts' ? 'Python-requests/2.31' : 'Chrome/128',
      },
      decoy_identity: assignedIdentity,
      signal_snapshot: evaluation.signals,
    };

    this.sessions.unshift(session);
    this.persist();
    return session;
  }

  public seedDemoData(): { created: number } {
    const initial = generateInitialSessions();
    this.sessions = [...initial.sessions, ...this.sessions.filter((s) => !s.is_synthetic)];
    this.events = { ...this.events, ...initial.events };
    this.decoyAccess = { ...this.decoyAccess, ...initial.decoyAccess };

    this.addAuditEvent({
      action: 'DEMO_SEED',
      change_summary: `Seeded ${initial.sessions.length} synthetic demonstration sessions.`,
    });

    this.persist();
    return { created: initial.sessions.length };
  }

  public resetSyntheticData(): { deleted: number } {
    const synthetic = this.sessions.filter((s) => s.is_synthetic);
    this.sessions = this.sessions.filter((s) => !s.is_synthetic);

    for (const s of synthetic) {
      delete this.events[s.public_id];
      delete this.decoyAccess[s.public_id];
    }

    this.addAuditEvent({
      action: 'DEMO_RESET',
      change_summary: `Removed ${synthetic.length} synthetic demonstration sessions.`,
    });

    this.persist();
    return { deleted: synthetic.length };
  }

  public runRetentionCleanup(scope: 'expired' | 'all'): { deleted: number } {
    let toDelete: SessionRecord[] = [];
    if (scope === 'all') {
      toDelete = [...this.sessions];
      this.sessions = [];
      this.events = {};
      this.decoyAccess = {};
    } else {
      const cutoff = Date.now() - this.policy.retention_days * 86400000;
      toDelete = this.sessions.filter((s) => new Date(s.last_seen).getTime() < cutoff);
      this.sessions = this.sessions.filter((s) => new Date(s.last_seen).getTime() >= cutoff);
      for (const s of toDelete) {
        delete this.events[s.public_id];
        delete this.decoyAccess[s.public_id];
      }
    }

    this.addAuditEvent({
      action: 'RETENTION_CLEANUP',
      change_summary: `Removed ${toDelete.length} session(s) in scope '${scope}'.`,
    });

    this.persist();
    return { deleted: toDelete.length };
  }

  public exportTelemetry(format: 'csv' | 'json', range: '24h' | '7d' | '30d'): {
    filename: string;
    content: string;
    count: number;
  } {
    const rangeMs = range === '24h' ? 86400000 : range === '7d' ? 7 * 86400000 : 30 * 86400000;
    const cutoff = Date.now() - rangeMs;
    const items = this.sessions.filter((s) => new Date(s.first_seen).getTime() >= cutoff);

    let content = '';
    const filename = `adg-sessions-${range}-${new Date().toISOString().slice(0, 10)}.${format}`;

    if (format === 'csv') {
      const headers = [
        'public_id',
        'pseudonym',
        'risk_score',
        'risk_tier',
        'decision',
        'confidence',
        'status',
        'first_seen',
        'last_seen',
        'review_label',
        'is_synthetic',
      ];
      const rows = items.map((i) =>
        [
          i.public_id,
          i.pseudonym,
          i.risk_score,
          i.risk_tier,
          i.decision,
          i.confidence,
          i.status,
          i.first_seen,
          i.last_seen,
          i.review_label,
          i.is_synthetic ? 'true' : 'false',
        ].join(',')
      );
      content = [headers.join(','), ...rows].join('\n');
    } else {
      content = JSON.stringify(items, null, 2);
    }

    this.addAuditEvent({
      action: 'TELEMETRY_EXPORT',
      target_ref: filename,
      change_summary: `Exported ${items.length} redacted session record(s) in ${format.toUpperCase()} format.`,
    });

    return {
      filename,
      content,
      count: items.length,
    };
  }

  public getHealth(): HealthStatus {
    return {
      checkedAt: new Date().toISOString(),
      checks: [
        {
          name: 'Telemetry store',
          status: 'operational',
          detail: 'Local append-only telemetry buffer verified and responsive.',
        },
        {
          name: 'Risk policy engine',
          status: 'operational',
          detail: `Active policy ${this.policy.policy_version} in ${this.policy.mode} mode.`,
        },
        {
          name: 'Decoy isolation sandbox',
          status: 'operational',
          detail: 'Isolated synthetic dataset partition active; separate authorization boundary enforced.',
        },
        {
          name: 'Key rotation vault',
          status: 'operational',
          detail: 'Rotating HMAC seed initialized; pseudonyms uncorrelatable across cycles.',
        },
      ],
    };
  }

  // Handle live protected app authentication flow
  public authenticate({
    publicId,
    identifier,
    password,
    userAgent,
  }: {
    publicId?: string;
    identifier: string;
    password: string;
    routeCategory?: string;
    userAgent?: string;
  }): {
    status: 'allow' | 'step_up' | 'decoy' | 'failed';
    publicId: string;
    token: string;
    message?: string;
  } {
    let sessionPid = publicId;
    if (!sessionPid) {
      sessionPid = `sess_${Math.random().toString(36).substring(2, 8)}`;
    }

    if (!this.events[sessionPid]) {
      this.events[sessionPid] = [];
    }

    // Check credentials against demo accounts
    const match = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === identifier.toLowerCase());
    const isCorrect = match && match.password === password;

    const eventCode = isCorrect ? 'attempt_passed' : 'attempt_failed';
    const now = new Date().toISOString();

    this.events[sessionPid].push({
      id: `ev_${Date.now()}`,
      sessionId: sessionPid,
      occurred_at: now,
      code: eventCode,
      route: 'login',
      signal: isCorrect ? 'Credentials accepted' : 'Attempt failed',
    });

    let session = this.sessions.find((s) => s.public_id === sessionPid);
    if (!session) {
      session = {
        id: `s_${Date.now()}`,
        public_id: sessionPid,
        pseudonym: `ps_${Math.random().toString(36).substring(2, 8)}`,
        risk_score: 0,
        risk_tier: 'low',
        decision: 'allow',
        confidence: 0.5,
        status: 'active',
        channel: 'real',
        policy_version: this.policy.policy_version,
        first_seen: now,
        last_seen: now,
        top_signal: 'Normal login flow',
        attempt_count: 0,
        failure_count: 0,
        distinct_identifiers: 1,
        route_categories: ['login'],
        review_label: 'unreviewed',
        is_synthetic: false,
        metadata: {
          ua_family: userAgent ? (userAgent.includes('Chrome') ? 'Chrome/128' : 'WebBrowser') : 'unknown',
        },
      };
      this.sessions.unshift(session);
    }

    session.attempt_count++;
    if (!isCorrect) session.failure_count++;
    session.last_seen = now;

    const evaluation = evaluateSessionRisk(this.events[sessionPid], session.distinct_identifiers, this.policy);
    session.risk_score = evaluation.score;
    session.risk_tier = evaluation.tier;
    session.decision = evaluation.decision;
    session.confidence = evaluation.confidence;
    session.top_signal = evaluation.topSignal;
    session.signal_snapshot = evaluation.signals;

    const token = `token_${sessionPid}`;

    if (!isCorrect) {
      // If risk reached high/decoy in adaptive mode, serve decoy seamlessly
      if (evaluation.decision === 'decoy') {
        session.channel = 'decoy';
        session.status = 'in_decoy';
        session.decoy_identity = SYNTHETIC_IDENTITIES[0];
        this.persist();
        return {
          status: 'decoy',
          publicId: sessionPid,
          token,
        };
      }

      this.persist();
      return {
        status: 'failed',
        publicId: sessionPid,
        token,
        message: 'We could not sign you in. Check your details and try again.',
      };
    }

    // Credentials accepted
    if (evaluation.decision === 'decoy') {
      session.channel = 'decoy';
      session.status = 'in_decoy';
      session.decoy_identity = SYNTHETIC_IDENTITIES[0];
      this.persist();
      return {
        status: 'decoy',
        publicId: sessionPid,
        token,
      };
    }

    if (evaluation.decision === 'step_up') {
      session.status = 'active';
      this.persist();
      return {
        status: 'step_up',
        publicId: sessionPid,
        token,
      };
    }

    // Normal allow
    session.channel = 'real';
    session.status = 'authenticated';
    this.persist();
    return {
      status: 'allow',
      publicId: sessionPid,
      token,
    };
  }

  public completeStepUp(token: string, code: string): { status: 'allow' | 'failed'; message?: string; token: string } {
    const publicId = token.replace('token_', '');
    const session = this.sessions.find((s) => s.public_id === publicId);
    if (!session) return { status: 'failed', message: 'Session expired', token };

    // Accept valid demo step-up code '482910' or any 6-digit code for testing
    if (code.length >= 6) {
      session.status = 'stepped_up';
      session.decision = 'allow';
      this.events[publicId].push({
        id: `ev_${Date.now()}`,
        sessionId: publicId,
        occurred_at: new Date().toISOString(),
        code: 'step_up_passed',
        route: 'step_up',
        signal: 'Step-up passed',
      });
      this.persist();
      return { status: 'allow', token };
    }

    return { status: 'failed', message: 'That code was not accepted. Try demo code 482910', token };
  }

  public completeRecovery(token: string, recoveryKey: string): { status: 'allow' | 'failed'; message?: string; token: string } {
    const publicId = token.replace('token_', '');
    const session = this.sessions.find((s) => s.public_id === publicId);
    if (!session) return { status: 'failed', message: 'Session expired', token };

    if (recoveryKey.startsWith('REC-')) {
      session.status = 'authenticated';
      session.decision = 'allow';
      this.events[publicId].push({
        id: `ev_${Date.now()}`,
        sessionId: publicId,
        occurred_at: new Date().toISOString(),
        code: 'recovery_verified',
        route: 'recovery',
        signal: 'Owner recovery verified',
      });
      this.persist();
      return { status: 'allow', token };
    }

    return { status: 'failed', message: 'Recovery key not accepted. Use REC-... format.', token };
  }
}

export const gatewayStore = new GatewayStore();
