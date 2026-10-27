# Adaptive Deception Gateway (Deflect Shield Gate)

An explainable login risk gateway and operator console. It observes session behavior, transparently scores risk across 10 behavioral threat signals, makes routing decisions (`allow`, `step-up`, or `isolated decoy`), and provides full explainability and investigation tools for every decision.

Recreated and generated from `https://deflect-shield-gate.base44.app`.

---

## Key Capabilities & Architecture

1. **Zero Credential Storage Guarantee**:
   - Passwords, OTP codes, and emergency recovery secrets are handled transiently by the auth adapter and compared in constant time.
   - Raw account identifiers are never stored; telemetry records only rotating keyed pseudonym digests (e.g. `ps_44a1b0`).
   - No IP addresses, browser fingerprinting, or raw keystroke streams are captured.

2. **10-Signal Transparent Risk Engine**:
   - `ATTEMPT_BURST`: Several authentication attempts inside a one-minute window (weight: 18).
   - `TIMING_REGULARITY`: Metronomic timing between attempts characteristic of bots/scripts (weight: 14).
   - `FAILURE_STREAK`: Consecutive failed attempts at the end of the session (weight: 16).
   - `RETRY_PRESSURE`: High cumulative failure count across the session (weight: 12).
   - `NO_ADAPTATION`: Request shape repeats identically after neutral responses (weight: 12).
   - `IDENTIFIER_SPRAY`: Several distinct account usernames attempted from one session (weight: 20).
   - `ROUTE_PROBING`: Probing nonexistent routes or sensitive endpoints (weight: 12).
   - `REPEATED_PATTERN`: The same request shape replayed repeatedly (weight: 9).
   - `CONTINUITY_CHANGE`: Gateway session token reissued mid-flow (weight: 8).
   - `INPUT_CADENCE`: Keystroke cadence aggregate anomaly (weight: 6, opt-in).

3. **Dual Requirement for Decoy Isolation**:
   - A single signal can never route a session to the decoy.
   - Decoy routing in `adaptive` mode strictly requires **both**:
     1. Overall score $\ge$ high threshold (default: 62).
     2. At least two strong, independent signals ($intensity \ge 0.5$).

4. **Integrated Sample Protected Portal**:
   - **Meridian Freight Cooperative**: A carrier settlement and freight accounting portal.
   - Includes 3 preconfigured demo accounts with different risk tolerances:
     - Ada Whitfield (`ada.whitfield@meridianfreight.example` / `Ledger-Demo-2026`)
     - Marcus Ibe (`marcus.ibe@meridianfreight.example` / `Ops-Demo-2026`)
     - Priya Raman (`priya.raman@meridianfreight.example` / `Settle-Demo-2026`)
   - Normal authentications access the genuine settlement ledger.
   - High-risk sessions are silently deflected to the isolated synthetic decoy environment with fabricated data while logging attacker exploration.

5. **Operator Console Pages**:
   - **Overview** (`/`): KPI cards, risk mix over time (Recharts Area), decision distribution bars, live gateway events feed, top signals, decoy engagement counter.
   - **Sessions** (`/sessions`): Search by reference/pseudonym, filter by 24h/7d/30d range, risk tier, decision, and review status.
   - **Session Detail** (`/sessions/:sessionId`): Visual risk meter, confidence gauge, signal contribution breakdown (`weight × intensity`), interactive event timeline, decoy record access list, decision facts, and analyst review workflow.
   - **Decoy Preview** (`/decoy-preview`): Visual preview of what high-risk attackers see and isolation guarantees.
   - **Risk Policy** (`/policy`): Mode switcher (`monitor`, `challenge`, `adaptive`), threshold sliders, signal weights, and versioning.
   - **Simulator** (`/simulator`): 4 live simulation scenarios (`normal_typo`, `forgetful_step_up`, `scripted_bursts`, `decoy_explorer`), Seed 7 Days demo data, and data reset.
   - **Audit Trail** (`/audit`): Append-only governance log of policy modifications, reviews, exports, and data purges.
   - **Settings** (`/settings`): Decoy delay cap, session timeout, retention cleanup, CSV/JSON export, and system health checks.
   - **Trust Boundaries** (`/security`): Technical documentation of security guarantees and fail-closed architecture.

---

## Project Structure

```
deflect-shield-gate/
├── src/
│   ├── types/
│   │   └── gateway.ts              # Domain models, types & interfaces
│   ├── lib/
│   │   ├── engine.ts               # Risk evaluation engine & signal definitions
│   │   ├── mockData.ts             # Demo credentials, synthetic identities, datasets & scenarios
│   │   ├── store.ts                # Reactive state store with localStorage persistence & audit logging
│   │   └── utils.ts                # Formatting, badge styles & theme helpers
│   ├── components/
│   │   ├── PageHeader.tsx          # Standardized console page header
│   │   ├── FilterBar.tsx           # Time, tier, decision & review filters
│   │   ├── Chips.tsx               # Risk, decision, review & synthetic badge chips
│   │   ├── RiskMeter.tsx           # Visual risk score gauge & signal breakdown
│   │   ├── EventTimeline.tsx       # Session event timeline visualization
│   │   ├── TrendChart.tsx          # Recharts risk mix area chart
│   │   ├── DecisionDistribution.tsx# Interactive decision distribution progress
│   │   ├── LatestEventsFeed.tsx    # Live telemetry feed of gateway events
│   │   ├── TopSignalsList.tsx      # Signal frequency ranking bars
│   │   └── Toast.tsx               # Contextual toast notifications
│   ├── layouts/
│   │   └── ConsoleLayout.tsx       # Responsive operator sidebar & header navigation
│   ├── pages/
│   │   ├── OverviewPage.tsx        # Gateway analytics & metrics dashboard
│   │   ├── SessionsPage.tsx        # Filterable & searchable sessions directory
│   │   ├── SessionDetailPage.tsx   # Deep-dive session inspection & review
│   │   ├── DecoyPreviewPage.tsx    # Operator preview of the synthetic decoy workspace
│   │   ├── PolicyPage.tsx          # Mode, threshold & signal weights configuration
│   │   ├── SimulatorPage.tsx       # Live attack simulation & demo data generator
│   │   ├── AuditPage.tsx           # Append-only governance & compliance log
│   │   ├── SettingsPage.tsx        # Pacing, exports, retention cleanup & health checks
│   │   ├── SecurityPage.tsx        # Architectural trust boundaries & privacy explainer
│   │   ├── ProtectedAppLoginPage.tsx     # Meridian Freight demo login & challenge portal
│   │   └── ProtectedAppWorkspacePage.tsx # Authentic / Decoy carrier settlement workspace
│   ├── App.tsx                     # React Router tree
│   ├── main.tsx                    # React DOM entry point
│   └── index.css                   # Tailwind base, dark palette & typography styles
├── index.html                      # HTML template with fonts & dark theme
├── package.json                    # Dependencies & scripts
├── tailwind.config.js              # Custom Tailwind configuration
├── postcss.config.js               # PostCSS plugins
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite bundler configuration
```

---

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
# or: npm install
```

### 2. Start Development Server
```bash
pnpm run dev
# or: npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
pnpm run build
```
Creates an optimized production bundle in `dist/`.
