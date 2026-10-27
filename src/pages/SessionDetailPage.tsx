import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RiskTierChip, DecisionChip, ReviewStatusChip, SyntheticChip } from '../components/Chips';
import { RiskMeter, SignalContributionsTable } from '../components/RiskMeter';
import { EventTimeline } from '../components/EventTimeline';
import { useToast } from '../components/Toast';
import { gatewayStore } from '../lib/store';
import { formatDateUTC, formatTimeAgo, statusMeta } from '../lib/utils';
import { ReviewLabel } from '../types/gateway';

function FactField({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="label-mono">{label}</p>
      <p className="mt-0.5 break-words text-[12.5px] text-foreground">{value || '—'}</p>
    </div>
  );
}

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sessionData, setSessionData] = useState(() =>
    sessionId ? gatewayStore.getSession(sessionId) : null
  );
  const [selectedLabel, setSelectedLabel] = useState<ReviewLabel>('unreviewed');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!sessionId) return;
    const data = gatewayStore.getSession(sessionId);
    setSessionData(data);
    if (data?.session) {
      setSelectedLabel(data.session.review_label);
      setNotes(data.session.review_note || '');
    }

    return gatewayStore.subscribe(() => {
      const updated = gatewayStore.getSession(sessionId);
      setSessionData(updated);
    });
  }, [sessionId]);

  if (!sessionData) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-[13px] font-medium">That session reference was not found.</p>
        <Link
          to="/sessions"
          className="mt-3 inline-block text-[12px] text-primary underline-offset-4 hover:underline"
        >
          Back to sessions
        </Link>
      </div>
    );
  }

  const { session, events, decoyAccess } = sessionData;
  const policy = gatewayStore.getPolicy();

  const handleSaveReview = async () => {
    if (selectedLabel === 'unreviewed') {
      toast.error('Choose a review label before saving.');
      return;
    }
    setSaving(true);
    try {
      gatewayStore.reviewSession(session.public_id, selectedLabel, notes.trim());
      toast.success('Review recorded in the audit trail.');
    } catch {
      toast.error('The review could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link
        to="/sessions"
        className="mb-4 inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>All sessions</span>
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-mono">Session investigation</p>
          <h1 className="mt-1 font-mono text-[22px] font-semibold tracking-tight">
            {session.public_id}
          </h1>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            keyed pseudonym {session.pseudonym}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RiskTierChip tier={session.risk_tier} score={session.risk_score} />
          <DecisionChip decision={session.decision} />
          <ReviewStatusChip label={session.review_label} />
          {session.is_synthetic ? <SyntheticChip /> : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* Left Column */}
        <div className="space-y-4">
          <RiskMeter
            score={session.risk_score}
            tier={session.risk_tier}
            thresholds={policy.thresholds}
            confidence={session.confidence}
          />

          <SignalContributionsTable signals={session.signal_snapshot || []} />

          {/* Event Timeline */}
          <div className="panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="label-mono">Event timeline</p>
              <p className="label-mono">{events.length} event(s)</p>
            </div>
            <EventTimeline events={events} />
          </div>

          {/* Decoy Artifact Access Log */}
          {decoyAccess.length > 0 ? (
            <div className="panel overflow-hidden">
              <div className="border-b border-border/70 px-4 py-3">
                <p className="label-mono">Decoy artifact access</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Synthetic records only. Categories and timestamps are retained; contents are not.
                </p>
              </div>
              <ul className="divide-y divide-border/60">
                {decoyAccess.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="font-mono text-[11px]">{item.artifact_id}</span>
                    <span className="label-mono">{item.artifact_category}</span>
                    <span className="label-mono">{item.action}</span>
                    <span className="ml-auto text-[10.5px] text-muted-foreground num">
                      {formatTimeAgo(item.occurred_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Decision Facts Panel */}
          <div className="panel p-4">
            <p className="label-mono">Decision facts</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <FactField label="Status" value={statusMeta[session.status] || session.status} />
              <FactField
                label="Channel"
                value={session.channel === 'decoy' ? 'Isolated decoy' : 'Real adapter'}
              />
              <FactField label="Policy version" value={session.policy_version} />
              <FactField
                label="Attempts"
                value={`${session.attempt_count} (${session.failure_count} failed)`}
              />
              <FactField
                label="Identifiers seen"
                value={`${session.distinct_identifiers} (keyed)`}
              />
              <FactField
                label="Route categories"
                value={session.route_categories?.join(', ') || '—'}
              />
              <FactField label="First seen" value={`${formatDateUTC(session.first_seen)} UTC`} />
              <FactField label="Last seen" value={`${formatDateUTC(session.last_seen)} UTC`} />
              <FactField label="Top signal" value={session.top_signal} />
              <FactField
                label="Request family"
                value={session.metadata?.ua_family || 'unknown'}
              />
              {session.scenario ? (
                <FactField label="Scenario" value={session.scenario} />
              ) : null}
              {session.decoy_identity?.ref ? (
                <FactField label="Decoy identity" value={session.decoy_identity.ref} />
              ) : null}
            </div>

            <p className="mt-4 border-t border-border/70 pt-3 text-[10.5px] leading-relaxed text-muted-foreground">
              No password, one-time code, recovery secret, IP address or raw identifier is stored for this session.
            </p>
          </div>

          {/* Analyst Review Panel */}
          <div className="panel p-4">
            <p className="label-mono">Analyst review</p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Record a human review decision. Review actions are written to the audit trail.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="label-mono block mb-1">Assessment</label>
                <select
                  value={selectedLabel}
                  onChange={(e) => setSelectedLabel(e.target.value as ReviewLabel)}
                  className="h-9 w-full rounded-lg border border-border bg-secondary/70 px-2.5 text-[12.5px] text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="unreviewed">Unreviewed</option>
                  <option value="likely_legitimate">Likely legitimate</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="inconclusive">Inconclusive</option>
                </select>
              </div>

              <div>
                <label className="label-mono block mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Rationale for the review label..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-secondary/70 p-2.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveReview}
                disabled={saving}
                className="w-full rounded-lg bg-primary py-2 text-[12px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? 'Saving review…' : 'Save review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
