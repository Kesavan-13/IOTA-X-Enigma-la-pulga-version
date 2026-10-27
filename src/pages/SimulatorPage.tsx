import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, LoaderCircle, Sparkles, RotateCcw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { RiskTierChip, DecisionChip } from '../components/Chips';
import { useToast } from '../components/Toast';
import { gatewayStore } from '../lib/store';
import { SIMULATOR_SCENARIOS } from '../lib/mockData';
import { SessionRecord } from '../types/gateway';

type ScenarioKey = keyof typeof SIMULATOR_SCENARIOS;

export function SimulatorPage() {
  const [runningKey, setRunningKey] = useState<ScenarioKey | null>(null);
  const [lastRun, setLastRun] = useState<(SessionRecord & { scenario: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const policy = gatewayStore.getPolicy();
  const toast = useToast();

  const scenariosList = Object.values(SIMULATOR_SCENARIOS);

  const handleRunScenario = async (key: ScenarioKey) => {
    setRunningKey(key);
    try {
      // Simulate small delay for realistic UX
      await new Promise((r) => setTimeout(r, 600));
      const session = gatewayStore.runSimulatorScenario(key);
      setLastRun({ ...session, scenario: key });
      toast.success('Synthetic session created.');
    } catch {
      toast.error('The scenario could not be generated.');
    } finally {
      setRunningKey(null);
    }
  };

  const handleSeed = async () => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const result = gatewayStore.seedDemoData();
      toast.success(`Seeded ${result.created} synthetic session(s).`);
    } catch {
      toast.error('Demonstration data could not be seeded.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const result = gatewayStore.resetSyntheticData();
      toast.success(`Removed ${result.deleted} synthetic session(s).`);
      setLastRun(null);
    } catch {
      toast.error('Demonstration data could not be reset.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Tune"
        title="Simulator"
        description="Every scenario runs through the same policy, scoring function and persistence path as the live sample-app flow. Generated sessions are marked synthetic and never leave this deployment."
        actions={
          <span className="rounded-md border border-border px-2 py-1 font-mono text-[10.5px] text-muted-foreground">
            mode {policy.mode} · {policy.policy_version}
          </span>
        }
      />

      {policy.mode === 'monitor' ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-200">
          Monitor mode is active: scenarios will be scored and logged, but no session is stepped up or sent to the decoy.
        </div>
      ) : null}

      {/* 4 Scenarios */}
      <div className="grid gap-3 sm:grid-cols-2">
        {scenariosList.map((sc) => {
          const isRunning = runningKey === sc.key;
          return (
            <div key={sc.key} className="panel flex flex-col p-4">
              <p className="text-[13px] font-semibold">{sc.title}</p>
              <p className="mt-1.5 flex-1 text-[11.5px] leading-relaxed text-muted-foreground">
                {sc.description}
              </p>
              <p className="label-mono mt-3">{sc.expect}</p>

              <button
                type="button"
                onClick={() => handleRunScenario(sc.key as ScenarioKey)}
                disabled={!!runningKey}
                className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
              >
                {isRunning ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FlaskConical className="h-3.5 w-3.5" />
                )}
                <span>Run scenario</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Last Run Session Card */}
      {lastRun ? (
        <div className="panel mt-4 p-4">
          <p className="label-mono">Last run</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              to={`/sessions/${lastRun.public_id}`}
              className="font-mono text-[12.5px] underline-offset-4 hover:underline text-foreground"
            >
              {lastRun.public_id}
            </Link>
            <RiskTierChip tier={lastRun.risk_tier} score={lastRun.risk_score} />
            <DecisionChip decision={lastRun.decision} />
            <span className="label-mono">scenario {lastRun.scenario}</span>
            <Link
              to="/sessions"
              className="ml-auto text-[11.5px] text-primary underline-offset-4 hover:underline"
            >
              Open in sessions
            </Link>
          </div>
        </div>
      ) : null}

      {/* Demonstration Data Controls */}
      <div className="panel mt-4 p-4">
        <p className="label-mono">Demonstration data</p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          Seed a week of synthetic telemetry across all four scenarios, or remove every synthetic session. Real sessions created through the sample app are never touched by a reset.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSeed}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Seed 7 days</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset synthetic data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
