import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, LoaderCircle, ShieldAlert, ShieldCheck, Sparkles, Zap, Radio } from 'lucide-react';
import { DEMO_ACCOUNTS, DemoUser } from '../lib/mockData';
import { gatewayStore } from '../lib/store';
import { AcidSquares } from '../components/AcidSquares';

export function ProtectedAppLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'step_up' | 'recovery'>('credentials');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const policy = gatewayStore.getPolicy();

  const handleFillDemo = (acc: DemoUser) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setRecoveryKey(acc.recovery_key);
    setErrorMessage('');
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Simulate real network / gateway pacing
      await new Promise((r) => setTimeout(r, 400));

      const res = gatewayStore.authenticate({
        publicId: sessionToken ? sessionToken.replace('token_', '') : undefined,
        identifier: email,
        password,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'WebClient',
      });

      setSessionToken(res.token);

      if (res.status === 'allow' || res.status === 'decoy') {
        navigate(`/protected-app/workspace?token=${res.token}`);
      } else if (res.status === 'step_up') {
        setStep('step_up');
      } else {
        setErrorMessage(
          res.message || 'We could not sign you in. Check your details and try again.'
        );
      }
    } catch {
      setErrorMessage('We could not sign you in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await new Promise((r) => setTimeout(r, 350));
      const res = gatewayStore.completeStepUp(sessionToken || '', code);
      if (res.status === 'allow') {
        navigate(`/protected-app/workspace?token=${res.token}`);
      } else {
        setErrorMessage(res.message || 'That code was not accepted.');
      }
    } catch {
      setErrorMessage('That code was not accepted.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await new Promise((r) => setTimeout(r, 350));
      const res = gatewayStore.completeRecovery(sessionToken || '', recoveryKey);
      if (res.status === 'allow') {
        navigate(`/protected-app/workspace?token=${res.token}`);
      } else {
        setErrorMessage(res.message || 'Recovery key was not accepted.');
      }
    } catch {
      setErrorMessage('Recovery key was not accepted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#120f17] text-foreground overflow-hidden">
      {/* Dynamic 3D AcidSquares WebGL Background with vibrant colors */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <AcidSquares
          color="#120f17"
          accentColor="#ff4fb8"
          secondaryColor="#3b6bff"
          tileSize={1}
          gap={0.12}
          roundness={0.25}
          rotation={35}
          waves={1}
          pulse={1}
          lighting="split"
          tilt={0.7}
          grain={0.12}
          intro={true}
          mouseInteraction={true}
        />
      </div>

      {/* Foreground Interactive Content */}
      <div className="relative z-10 flex min-h-screen flex-col pointer-events-none">
        {/* Top Floating Glass Navigation Header */}
        <header className="pointer-events-auto border-b border-acid-pink/20 bg-[#120f17]/75 px-4 py-3 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link
              to="/"
              className="group flex items-center gap-2 text-[12.5px] font-medium text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-acid-pink/30 bg-acid-pink/10 transition-colors group-hover:bg-acid-pink/20">
                <ArrowLeft className="h-3.5 w-3.5 text-acid-pink" />
              </div>
              <span>Return to Operator Console</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-acid-blue/30 bg-[#120f17]/80 px-3 py-1 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>DEFLECT SHIELD: ACTIVE</span>
              </div>
              <p className="label-mono text-acid-pink/80">Base44 Protected Gate</p>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_420px] lg:gap-16 lg:py-14 my-auto">
          {/* Left Column: Shield Overview & Demo Credentials */}
          <div className="order-2 lg:order-1 pointer-events-auto">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-acid-pink/40 bg-gradient-to-br from-acid-pink/20 to-acid-blue/20 shadow-[0_0_20px_rgba(255,79,184,0.25)]">
                <ShieldCheck className="h-5 w-5 text-acid-pink" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-white flex items-center gap-2">
                  <span>Meridian Freight Cooperative</span>
                  <span className="rounded-full border border-acid-pink/40 bg-acid-pink/15 px-2 py-0.5 text-[10px] font-mono text-acid-pink">
                    GATED
                  </span>
                </p>
                <p className="label-mono text-slate-400">Carrier settlement & freight ledger</p>
              </div>
            </div>

            <h1 className="mt-7 max-w-md text-[32px] font-bold leading-[1.1] tracking-tight text-white">
              Deflect Shield Gate <br />
              <span className="bg-gradient-to-r from-acid-pink via-purple-300 to-acid-blue bg-clip-text text-transparent">
                Adaptive Deception Access
              </span>
            </h1>

            <p className="mt-3.5 max-w-lg text-[13.5px] leading-relaxed text-slate-300">
              Protected by a 10-signal explainable behavioral risk engine. Normal sessions access genuine settlement ledgers; high-risk and automated probes are silently deflected into an isolated synthetic decoy environment.
            </p>

            {/* Interactive Background Tip Pill */}
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-acid-pink/20 bg-[#120f17]/60 p-3 text-[12px] text-slate-300 backdrop-blur-md">
              <Sparkles className="h-4 w-4 shrink-0 text-acid-pink animate-pulse" />
              <span>
                <strong>Interactive Canvas:</strong> Move your cursor to deform the 3D surface. Click anywhere on the background to send deflector ripples!
              </span>
            </div>

            {/* Demo Accounts List */}
            <div className="mt-8 space-y-3 max-w-md">
              <div className="flex items-center justify-between">
                <p className="label-mono text-acid-pink/90">Test Demonstrator Accounts</p>
                <span className="text-[11px] text-slate-400">Click to fill</span>
              </div>

              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleFillDemo(acc)}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-acid-pink/20 bg-[#120f17]/70 px-3.5 py-3 text-left transition-all hover:border-acid-pink/60 hover:bg-[#120f17]/90 hover:shadow-[0_0_20px_rgba(255,79,184,0.15)] backdrop-blur-md"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-slate-100 group-hover:text-acid-pink transition-colors">
                        {acc.name}
                      </p>
                      <span className="rounded bg-acid-blue/15 px-1.5 py-0.5 font-mono text-[9.5px] text-cyan-300">
                        {acc.role}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                      {acc.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[11px] text-slate-300 group-hover:text-white transition-colors block">
                      {acc.password}
                    </span>
                    <span className="text-[10px] text-acid-pink/80 group-hover:underline">fill credentials →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Glassmorphic Interactive Login Form */}
          <div className="order-1 lg:order-2 pointer-events-auto">
            <div className="panel-glass p-7 sm:p-8 backdrop-blur-2xl">
              {step === 'credentials' && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h2 className="text-[18px] font-bold tracking-tight text-white">
                        Gateway Verification
                      </h2>
                      <p className="mt-0.5 text-[12px] text-slate-400">
                        Enter credentials to proceed through the shield gate.
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-acid-blue/30 bg-acid-blue/10">
                      <Zap className="h-4 w-4 text-acid-blue" />
                    </div>
                  </div>

                  {errorMessage ? (
                    <div className="flex items-center gap-2.5 rounded-lg border border-red-500/40 bg-red-500/15 p-3 text-[12px] text-red-200">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{errorMessage}</span>
                    </div>
                  ) : null}

                  <div>
                    <label className="label-mono block mb-1.5 text-slate-300">Identity / Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@meridianfreight.example"
                      className="h-10 w-full rounded-lg border border-acid-pink/20 bg-[#120f17]/90 px-3.5 text-[13px] text-white placeholder-slate-500 focus:border-acid-pink focus:outline-none focus:ring-1 focus:ring-acid-pink transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="label-mono text-slate-300">Authentication Key</label>
                      <span className="text-[10.5px] text-slate-400">Zero-storage guarantee</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-10 w-full rounded-lg border border-acid-pink/20 bg-[#120f17]/90 px-3.5 text-[13px] text-white placeholder-slate-500 focus:border-acid-pink focus:outline-none focus:ring-1 focus:ring-acid-pink transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-acid-pink to-pink-600 py-3 text-[13px] font-semibold text-white shadow-[0_0_25px_rgba(255,79,184,0.35)] hover:opacity-95 hover:shadow-[0_0_35px_rgba(255,79,184,0.5)] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Deflect Check</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="border-t border-acid-pink/20 pt-3.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="label-mono text-acid-blue font-semibold">Policy: {policy.mode}</span>
                    <span className="font-mono text-[10px] text-slate-500">{policy.policy_version}</span>
                  </div>
                </form>
              )}

              {step === 'step_up' && (
                <form onSubmit={handleStepUpSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <ShieldAlert className="h-4 w-4" />
                      <h2 className="text-[17px] font-bold tracking-tight text-white">
                        Step-Up Verification Required
                      </h2>
                    </div>
                    <p className="mt-1 text-[12px] text-slate-400">
                      Behavioral anomaly detected. Please confirm session authorization.
                    </p>
                  </div>

                  {errorMessage ? (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/15 p-3 text-[12px] text-red-200">
                      {errorMessage}
                    </div>
                  ) : null}

                  <div>
                    <label className="label-mono block mb-1.5 text-slate-300">
                      One-time code (demo token: <span className="font-mono text-acid-pink font-bold">482910</span>)
                    </label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="6-digit verification code"
                      className="h-10 w-full rounded-lg border border-acid-pink/25 bg-[#120f17]/90 px-3.5 font-mono text-[14px] text-white focus:border-acid-pink focus:outline-none focus:ring-1 focus:ring-acid-pink"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-acid-pink to-pink-600 py-3 text-[13px] font-semibold text-white shadow-[0_0_25px_rgba(255,79,184,0.35)] hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Verify & Continue</span>
                    )}
                  </button>

                  <div className="pt-2 flex justify-between items-center text-[12px]">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('recovery');
                        setErrorMessage('');
                      }}
                      className="flex items-center gap-1.5 text-acid-pink hover:underline"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>Use emergency key</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('credentials');
                        setErrorMessage('');
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}

              {step === 'recovery' && (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <KeyRound className="h-4 w-4" />
                      <h2 className="text-[17px] font-bold tracking-tight text-white">
                        Emergency Account Recovery
                      </h2>
                    </div>
                    <p className="mt-1 text-[12px] text-slate-400">
                      Enter your cryptographic recovery key to bypass the verification challenge.
                    </p>
                  </div>

                  {errorMessage ? (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/15 p-3 text-[12px] text-red-200">
                      {errorMessage}
                    </div>
                  ) : null}

                  <div>
                    <label className="label-mono block mb-1.5 text-slate-300">Emergency Recovery Key</label>
                    <input
                      type="text"
                      required
                      value={recoveryKey}
                      onChange={(e) => setRecoveryKey(e.target.value)}
                      placeholder="REC-XXX-XXXX-XXX"
                      className="h-10 w-full rounded-lg border border-acid-blue/30 bg-[#120f17]/90 px-3.5 font-mono text-[13px] text-white focus:border-acid-blue focus:outline-none focus:ring-1 focus:ring-acid-blue"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-acid-blue to-blue-600 py-3 text-[13px] font-semibold text-white shadow-[0_0_25px_rgba(59,107,255,0.35)] hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Recover Session</span>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('step_up');
                        setErrorMessage('');
                      }}
                      className="text-[12px] text-slate-400 hover:text-white"
                    >
                      Back to code verification
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="pointer-events-auto border-t border-acid-pink/15 bg-[#120f17]/75 px-4 py-3 backdrop-blur-xl text-center text-[11px] text-slate-400 sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="font-mono text-slate-500">Deflect Shield Gate v2.4 • Base44 Architecture</span>
            <span className="text-acid-pink/80 font-mono text-[10.5px]">Zero Credential Storage Guarantee</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
export default ProtectedAppLoginPage;
