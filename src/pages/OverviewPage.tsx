import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FilterBar, FilterState } from '../components/FilterBar';
import { TrendChart, TrendDataPoint } from '../components/TrendChart';
import { DecisionDistribution } from '../components/DecisionDistribution';
import { LatestEventsFeed } from '../components/LatestEventsFeed';
import { TopSignalsList, SignalFrequency } from '../components/TopSignalsList';
import { gatewayStore } from '../lib/store';
import { GatewayEvent, SessionRecord } from '../types/gateway';

interface MetricCardProps {
  label: string;
  value: number;
  hint?: string;
  tone?: 'default' | 'low' | 'uncertain' | 'high';
}

function MetricCard({ label, value, hint, tone = 'default' }: MetricCardProps) {
  return (
    <div className="panel flex flex-col justify-between p-4">
      <p className="label-mono">{label}</p>
      <p
        className={`mt-3 text-[26px] font-semibold leading-none tracking-tight num ${
          tone === 'low'
            ? 'text-teal-300'
            : tone === 'uncertain'
            ? 'text-amber-300'
            : tone === 'high'
            ? 'text-orange-300'
            : ''
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function OverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState<SessionRecord[]>(gatewayStore.getSessions());

  useEffect(() => {
    return gatewayStore.subscribe(() => {
      setSessions(gatewayStore.getSessions());
    });
  }, []);

  const filterState: FilterState = {
    range: searchParams.get('range') || '7d',
    tier: searchParams.get('tier') || 'all',
    decision: searchParams.get('decision') || 'all',
    reviewed: searchParams.get('reviewed') || 'all',
  };

  const handleFilterChange = (next: FilterState) => {
    const params: Record<string, string> = {};
    if (next.range !== '7d') params.range = next.range;
    if (next.tier !== 'all') params.tier = next.tier;
    if (next.decision !== 'all') params.decision = next.decision;
    if (next.reviewed !== 'all') params.reviewed = next.reviewed;
    setSearchParams(params);
  };

  // Filter sessions according to range, tier, decision, reviewed
  const filteredSessions = useMemo(() => {
    const now = Date.now();
    const rangeMs =
      filterState.range === '24h'
        ? 86400000
        : filterState.range === '30d'
        ? 30 * 86400000
        : 7 * 86400000;

    return sessions.filter((s) => {
      const seenTime = new Date(s.first_seen).getTime();
      if (now - seenTime > rangeMs) return false;

      if (filterState.tier !== 'all' && s.risk_tier !== filterState.tier) return false;
      if (filterState.decision !== 'all' && s.decision !== filterState.decision) return false;
      if (filterState.reviewed === 'reviewed' && s.review_label === 'unreviewed') return false;
      if (filterState.reviewed === 'unreviewed' && s.review_label !== 'unreviewed') return false;

      return true;
    });
  }, [sessions, filterState]);

  // Aggregate totals
  const totals = useMemo(() => {
    const low = filteredSessions.filter((s) => s.risk_tier === 'low').length;
    const uncertain = filteredSessions.filter((s) => s.risk_tier === 'uncertain').length;
    const high = filteredSessions.filter((s) => s.risk_tier === 'high').length;
    const authenticated = filteredSessions.filter((s) => s.status === 'authenticated').length;
    const steppedUp = filteredSessions.filter((s) => s.status === 'stepped_up').length;
    const inDecoy = filteredSessions.filter((s) => s.channel === 'decoy').length;

    return {
      sessions: filteredSessions.length,
      low,
      uncertain,
      high,
      authenticated,
      steppedUp,
      inDecoy,
    };
  }, [filteredSessions]);

  // Decoy total accesses
  const decoyAccessCount = useMemo(() => {
    let count = 0;
    filteredSessions.forEach((s) => {
      const accesses = gatewayStore.getDecoyAccessForSession(s.public_id);
      count += accesses.length;
    });
    return count;
  }, [filteredSessions]);

  // Trend data by day
  const trendData = useMemo<TrendDataPoint[]>(() => {
    const daysMap: Record<string, { low: number; uncertain: number; high: number }> = {};
    const daysCount = filterState.range === '24h' ? 2 : filterState.range === '30d' ? 30 : 7;
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      daysMap[key] = { low: 0, uncertain: 0, high: 0 };
    }

    filteredSessions.forEach((s) => {
      const key = s.first_seen.slice(0, 10);
      if (daysMap[key]) {
        daysMap[key][s.risk_tier]++;
      }
    });

    return Object.entries(daysMap).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }, [filteredSessions, filterState.range]);

  // Top signals
  const topSignals = useMemo<SignalFrequency[]>(() => {
    const freq: Record<string, { label: string; count: number }> = {};
    filteredSessions.forEach((s) => {
      if (s.signal_snapshot) {
        s.signal_snapshot.forEach((sig) => {
          if (sig.contribution > 0) {
            if (!freq[sig.code]) {
              freq[sig.code] = { label: sig.label, count: 0 };
            }
            freq[sig.code].count++;
          }
        });
      }
    });

    return Object.entries(freq)
      .map(([code, data]) => ({
        code,
        label: data.label,
        sessions: data.count,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 4);
  }, [filteredSessions]);

  // Latest gateway events across all sessions
  const latestEvents = useMemo(() => {
    const allEvents: Array<GatewayEvent & { publicId: string }> = [];
    sessions.forEach((s) => {
      const evs = gatewayStore.getEventsForSession(s.public_id);
      evs.forEach((e) => {
        allEvents.push({ ...e, publicId: s.public_id, scoreAfter: s.risk_score });
      });
    });
    return allEvents.sort(
      (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );
  }, [sessions]);

  return (
    <div>
      <PageHeader
        eyebrow="Operate"
        title="Gateway overview"
        description="Session behaviour, routing decisions and decoy engagement for the selected window. Every number is read from persisted, redacted telemetry."
        actions={
          <Link
            to="/simulator"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>Run a scenario</span>
          </Link>
        }
      />

      <FilterBar value={filterState} onChange={handleFilterChange} />

      {/* 4 Metric KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Observed sessions"
          value={totals.sessions}
          hint={`Window ${filterState.range}`}
        />
        <MetricCard
          label="Low risk"
          value={totals.low}
          hint="Continued without friction"
          tone="low"
        />
        <MetricCard
          label="Uncertain"
          value={totals.uncertain}
          hint="Throttled and stepped up"
          tone="uncertain"
        />
        <MetricCard
          label="High risk"
          value={totals.high}
          hint="Served the isolated decoy"
          tone="high"
        />
      </div>

      {totals.sessions === 0 ? (
        <div className="panel mt-4 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-medium">No sessions in this window yet.</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Run a simulator scenario, or use the sample app sign-in to exercise the live gateway path.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/simulator"
              className="rounded-lg bg-primary px-3 py-2 text-[12px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Open simulator
            </Link>
            <Link
              to="/protected-app"
              className="rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground"
            >
              Sample app
            </Link>
          </div>
        </div>
      ) : null}

      {/* Row 1: Charts */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <TrendChart data={trendData} />
        <DecisionDistribution totals={totals} />
      </div>

      {/* Row 2: Live Activity & Signals */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <LatestEventsFeed events={latestEvents} />
        <div className="space-y-4">
          <TopSignalsList signals={topSignals} />
          <div className="panel p-4">
            <p className="label-mono">Decoy engagement</p>
            <p className="mt-2 text-[22px] font-semibold leading-none num text-orange-300">
              {decoyAccessCount}
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              Synthetic records opened across decoy sessions in this window. Only categories and timestamps are retained.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
