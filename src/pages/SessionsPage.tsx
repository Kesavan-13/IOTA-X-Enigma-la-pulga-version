import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FilterBar, FilterState } from '../components/FilterBar';
import { RiskTierChip, DecisionChip, ReviewStatusChip, SyntheticChip } from '../components/Chips';
import { gatewayStore } from '../lib/store';
import { formatDateUTC, formatTimeAgo } from '../lib/utils';
import { SessionRecord } from '../types/gateway';

export function SessionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState<SessionRecord[]>(gatewayStore.getSessions());
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

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
    if (searchQuery.trim()) params.q = searchQuery.trim();
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (filterState.range !== '7d') params.range = filterState.range;
    if (filterState.tier !== 'all') params.tier = filterState.tier;
    if (filterState.decision !== 'all') params.decision = filterState.decision;
    if (filterState.reviewed !== 'all') params.reviewed = filterState.reviewed;
    if (searchQuery.trim()) params.q = searchQuery.trim();
    setSearchParams(params);
  };

  const filteredSessions = useMemo(() => {
    const now = Date.now();
    const rangeMs =
      filterState.range === '24h'
        ? 86400000
        : filterState.range === '30d'
        ? 30 * 86400000
        : 7 * 86400000;

    const q = searchQuery.toLowerCase().trim();

    return sessions.filter((s) => {
      const seenTime = new Date(s.first_seen).getTime();
      if (now - seenTime > rangeMs) return false;

      if (filterState.tier !== 'all' && s.risk_tier !== filterState.tier) return false;
      if (filterState.decision !== 'all' && s.decision !== filterState.decision) return false;
      if (filterState.reviewed === 'reviewed' && s.review_label === 'unreviewed') return false;
      if (filterState.reviewed === 'unreviewed' && s.review_label !== 'unreviewed') return false;

      if (q) {
        const matchesPid = s.public_id.toLowerCase().includes(q);
        const matchesPseudo = s.pseudonym.toLowerCase().includes(q);
        if (!matchesPid && !matchesPseudo) return false;
      }

      return true;
    });
  }, [sessions, filterState, searchQuery]);

  return (
    <div>
      <PageHeader
        eyebrow="Investigate"
        title="Sessions"
        description="Pseudonymous session references only. Raw identifiers, passwords and one-time codes are never stored, displayed or exported."
      />

      <FilterBar value={filterState} onChange={handleFilterChange}>
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-end gap-2 sm:min-w-[220px]">
          <label className="flex w-full flex-col gap-1">
            <span className="label-mono">Search reference</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.slice(0, 40))}
              placeholder="sess_ or keyed pseudonym"
              className="h-9 w-full rounded-lg border border-border bg-secondary/70 px-2.5 font-mono text-[12px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Search sessions"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>
      </FilterBar>

      {filteredSessions.length > 0 ? (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-border/70 text-muted-foreground">
                  <th className="label-mono px-4 py-2.5 font-medium">Session</th>
                  <th className="label-mono px-4 py-2.5 font-medium">Risk</th>
                  <th className="label-mono px-4 py-2.5 font-medium">Decision</th>
                  <th className="label-mono px-4 py-2.5 font-medium">Top signal</th>
                  <th className="label-mono px-4 py-2.5 font-medium">First seen</th>
                  <th className="label-mono px-4 py-2.5 font-medium">Last seen</th>
                  <th className="label-mono px-4 py-2.5 font-medium">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="group transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <Link
                        to={`/sessions/${s.public_id}`}
                        className="font-mono text-[12px] font-medium underline-offset-4 group-hover:underline text-foreground"
                      >
                        {s.public_id}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="font-mono text-[10.5px] text-muted-foreground">
                          {s.pseudonym}
                        </span>
                        {s.is_synthetic ? <SyntheticChip /> : null}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <RiskTierChip tier={s.risk_tier} score={s.risk_score} />
                    </td>

                    <td className="px-4 py-3">
                      <DecisionChip decision={s.decision} />
                    </td>

                    <td className="max-w-[220px] px-4 py-3 text-[12px] text-muted-foreground">
                      <span className="line-clamp-1 text-foreground">{s.top_signal}</span>
                      <span className="label-mono block mt-0.5">policy {s.policy_version}</span>
                    </td>

                    <td className="px-4 py-3 text-[11.5px] text-muted-foreground num">
                      {formatDateUTC(s.first_seen)}
                    </td>

                    <td className="px-4 py-3 text-[11.5px] text-muted-foreground">
                      <span className="num">{formatTimeAgo(s.last_seen)}</span>
                    </td>

                    <td className="px-4 py-3">
                      <ReviewStatusChip label={s.review_label} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="panel p-8 text-center">
          <p className="text-[13px] font-medium">No sessions match these filters.</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Widen the time range, or run a simulator scenario to generate synthetic sessions.
          </p>
        </div>
      )}
    </div>
  );
}
