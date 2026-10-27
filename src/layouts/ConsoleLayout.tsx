import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Eye,
  SlidersHorizontal,
  FlaskConical,
  ScrollText,
  Settings2,
  ShieldCheck,
  ShieldAlert,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { gatewayStore } from '../lib/store';
import { modeMeta } from '../lib/utils';
import { PolicyConfig } from '../types/gateway';
import { AcidSquares } from '../components/AcidSquares';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: Array<{ group: string; items: NavItem[] }> = [
  {
    group: 'Operate',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard },
      { to: '/sessions', label: 'Sessions', icon: Activity },
      { to: '/decoy-preview', label: 'Decoy preview', icon: Eye },
    ],
  },
  {
    group: 'Tune',
    items: [
      { to: '/policy', label: 'Risk policy', icon: SlidersHorizontal },
      { to: '/simulator', label: 'Simulator', icon: FlaskConical },
    ],
  },
  {
    group: 'Govern',
    items: [
      { to: '/audit', label: 'Audit trail', icon: ScrollText },
      { to: '/settings', label: 'Settings', icon: Settings2 },
      { to: '/security', label: 'Trust boundaries', icon: ShieldCheck },
    ],
  },
];

export function ConsoleLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [policy, setPolicy] = useState<PolicyConfig>(gatewayStore.getPolicy());
  const [bgMode, setBgMode] = useState<'ambient' | 'vibrant' | 'minimal'>('ambient');
  const location = useLocation();

  useEffect(() => {
    return gatewayStore.subscribe(() => {
      setPolicy(gatewayStore.getPolicy());
    });
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const mode = policy.mode;
  const modeBadgeColor =
    mode === 'monitor'
      ? 'border-slate-500/30 bg-slate-500/10 text-slate-300'
      : mode === 'challenge'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      : 'border-acid-pink/40 bg-acid-pink/15 text-acid-pink shadow-[0_0_12px_rgba(255,79,184,0.2)]';

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-6">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-acid-pink/40 bg-acid-pink/15 shadow-[0_0_15px_rgba(255,79,184,0.3)]">
            <ShieldAlert className="h-4 w-4 text-acid-pink" strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-bold tracking-tight text-white">
              Deflect Shield Gate
            </span>
            <span className="label-mono text-acid-pink/80">Adaptive Deception</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-6">
          {NAV_GROUPS.map((grp) => (
            <div key={grp.group}>
              <p className="label-mono px-2.5 pb-2 text-slate-400">{grp.group}</p>
              <div className="flex flex-col gap-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all ${
                          isActive
                            ? 'bg-acid-pink/20 text-white font-semibold border border-acid-pink/40 shadow-[0_0_15px_rgba(255,79,184,0.15)]'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80 group-hover:text-acid-pink transition-colors" strokeWidth={1.75} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          <Link
            to="/protected-app"
            onClick={onNavigate}
            className="group flex items-center justify-between rounded-xl border border-acid-pink/35 bg-gradient-to-r from-acid-pink/15 to-acid-blue/15 px-3 py-2.5 text-[12.5px] font-semibold text-white transition-all hover:border-acid-pink hover:shadow-[0_0_20px_rgba(255,79,184,0.25)]"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acid-pink opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-acid-pink"></span>
              </span>
              <span>Launch Shield App</span>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-acid-pink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </nav>
      </div>

      <div className="border-t border-acid-pink/15 pt-4 text-[11px] text-slate-400">
        <p className="label-mono text-acid-blue font-semibold">Deployment mode</p>
        <p className="mt-1 font-mono text-[10.5px]">v2.4 · zero credential storage</p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#120f17] text-foreground">
      {/* Dynamic 3D AcidSquares WebGL Background Layer */}
      {bgMode !== 'minimal' && (
        <div
          className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${
            bgMode === 'vibrant' ? 'opacity-80' : 'opacity-30'
          }`}
        >
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
            intro={false}
            mouseInteraction={true}
          />
        </div>
      )}

      {/* Subtle Radial Gradient Glow Overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[500px] bg-[radial-gradient(65%_60%_at_50%_0%,rgba(255,79,184,0.12),transparent_75%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1560px]">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col justify-between border-r border-acid-pink/15 bg-[#120f17]/80 px-4 py-6 backdrop-blur-xl lg:flex">
          <NavContent />
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-[280px] border-r border-acid-pink/20 bg-[#120f17] px-4 py-6 shadow-xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-5 rounded-md p-1 text-slate-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <NavContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="min-w-0 flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-acid-pink/15 bg-[#120f17]/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-10">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md border border-acid-pink/20 p-2 text-slate-300 lg:hidden hover:text-white"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden min-w-0 items-center gap-2 lg:flex">
              <span className="label-mono text-acid-pink">Deflect Shield Gate</span>
              <span className="text-slate-600">/</span>
              <span className="text-[12px] text-slate-300">Operator Workspace</span>
            </div>

            {/* Right Controls: Background Mode Switcher & Mode Badge */}
            <div className="ml-auto flex items-center gap-3">
              {/* Shield Visualizer Toggle */}
              <div className="flex items-center rounded-lg border border-acid-pink/25 bg-[#120f17]/90 p-0.5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setBgMode('ambient')}
                  className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                    bgMode === 'ambient'
                      ? 'bg-acid-pink text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ambient background visualizer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span className="hidden sm:inline">Ambient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('vibrant')}
                  className={`rounded px-2 py-1 transition-colors ${
                    bgMode === 'vibrant'
                      ? 'bg-acid-pink text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vibrant high-contrast 3D mesh"
                >
                  <span className="hidden sm:inline">Vibrant</span>
                  <span className="sm:hidden">Vib</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('minimal')}
                  className={`rounded px-2 py-1 transition-colors ${
                    bgMode === 'minimal'
                      ? 'bg-acid-pink text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Minimalist dark mode"
                >
                  <span className="hidden sm:inline">Minimal</span>
                  <span className="sm:hidden">Off</span>
                </button>
              </div>

              {/* Mode & Policy Badge */}
              <div className={`flex items-center gap-2 rounded-full border px-3 py-1 ${modeBadgeColor}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {modeMeta[policy.mode]}
                </span>
                <span className="hidden font-mono text-[10px] opacity-75 sm:inline">
                  {policy.policy_version}
                </span>
              </div>
            </div>
          </header>

          {/* Main Route Content */}
          <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default ConsoleLayout;
