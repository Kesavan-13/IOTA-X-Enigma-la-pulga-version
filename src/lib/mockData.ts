import {
  AuditEvent,
  DecoyAccessRecord,
  DecoyIdentity,
  GatewayEvent,
  ProtectedAppDataset,
  SessionRecord,
} from '../types/gateway';

export interface DemoUser {
  email: string;
  password: string;
  recovery_key: string;
  step_seed: string;
  name: string;
  role: string;
}

export const DEMO_ACCOUNTS: DemoUser[] = [
  {
    email: 'ada.whitfield@meridianfreight.example',
    password: 'Ledger-Demo-2026',
    recovery_key: 'REC-ADA-8842-LEX',
    step_seed: 'ada-whitfield-demo-seed',
    name: 'Ada Whitfield',
    role: 'Finance lead',
  },
  {
    email: 'marcus.ibe@meridianfreight.example',
    password: 'Ops-Demo-2026',
    recovery_key: 'REC-MAR-2210-IBE',
    step_seed: 'marcus-ibe-demo-seed',
    name: 'Marcus Ibe',
    role: 'Operations manager',
  },
  {
    email: 'priya.raman@meridianfreight.example',
    password: 'Settle-Demo-2026',
    recovery_key: 'REC-PRI-5527-RAM',
    step_seed: 'priya-raman-demo-seed',
    name: 'Priya Raman',
    role: 'Settlement analyst',
  },
];

export const SYNTHETIC_IDENTITIES: DecoyIdentity[] = [
  {
    name: 'Ellis Marlowe',
    email: 'e.marlowe@meridianfreight.example',
    role: 'Settlement analyst',
    ref: 'dx_4417',
  },
  {
    name: 'Dana Okonjo',
    email: 'd.okonjo@meridianfreight.example',
    role: 'Finance associate',
    ref: 'dx_5528',
  },
  {
    name: 'Ravi Sunder',
    email: 'r.sunder@meridianfreight.example',
    role: 'Operations coordinator',
    ref: 'dx_6631',
  },
  {
    name: 'Nora Beaumont',
    email: 'n.beaumont@meridianfreight.example',
    role: 'Ledger reviewer',
    ref: 'dx_7742',
  },
];

export const DECOY_WORKSPACE_DATA: ProtectedAppDataset = {
  org: 'Meridian Freight Cooperative',
  plan: 'Cooperative operations',
  stats: [
    { label: 'Open settlements', value: '£864k', hint: '11 counterparties' },
    { label: 'In transit', value: '287 loads', hint: 'Across 4 corridors' },
    { label: 'Pending approvals', value: '3', hint: 'None overdue' },
  ],
  accounts: [
    {
      id: 'acct_5510',
      name: 'Halcyon Bulk Partners',
      category: 'Carrier',
      balance: 143890,
      status: 'Active',
      opened: '2023-11-04',
      ref: 'HB-5510',
    },
    {
      id: 'acct_5622',
      name: 'Tessellate Cargo',
      category: 'Carrier',
      balance: 61200,
      status: 'Active',
      opened: '2024-02-26',
      ref: 'TC-5622',
    },
    {
      id: 'acct_5740',
      name: 'Vantage Distribution',
      category: 'Shipper',
      balance: 288410,
      status: 'Review',
      opened: '2024-12-15',
      ref: 'VD-5740',
    },
    {
      id: 'acct_5891',
      name: 'Orchard Lane Freight',
      category: 'Partner',
      balance: 9870,
      status: 'Active',
      opened: '2025-04-30',
      ref: 'OL-5891',
    },
  ],
  transactions: [
    {
      id: 'txn_71204',
      date: '2026-10-24',
      counterparty: 'Halcyon Bulk Partners',
      amount: 9120,
      direction: 'in',
      reference: 'INV-5512',
      status: 'Settled',
    },
    {
      id: 'txn_71198',
      date: '2026-10-24',
      counterparty: 'Vantage Distribution',
      amount: 31770,
      direction: 'in',
      reference: 'INV-5508',
      status: 'Pending',
    },
    {
      id: 'txn_71190',
      date: '2026-10-23',
      counterparty: 'Tessellate Cargo',
      amount: 4260,
      direction: 'out',
      reference: 'PO-4410',
      status: 'Settled',
    },
    {
      id: 'txn_71182',
      date: '2026-10-23',
      counterparty: 'Orchard Lane Freight',
      amount: 880,
      direction: 'out',
      reference: 'FEE-402',
      status: 'Settled',
    },
    {
      id: 'txn_71174',
      date: '2026-10-22',
      counterparty: 'Halcyon Bulk Partners',
      amount: 18350,
      direction: 'in',
      reference: 'INV-5501',
      status: 'Settled',
    },
  ],
  activity: [
    {
      at: '2026-10-25T10:02:00Z',
      text: 'Settlement batch 4410 queued for approval',
    },
    {
      at: '2026-10-25T09:31:00Z',
      text: 'Tessellate Cargo added a secondary contact',
    },
    {
      at: '2026-10-24T16:22:00Z',
      text: 'Corridor utilisation report generated',
    },
  ],
  variation: {
    tone: 'warning',
    message: 'Settlement batch 4412 is delayed while banking details are revalidated.',
  },
};

export const REAL_WORKSPACE_DATA: ProtectedAppDataset = {
  org: 'Meridian Freight Cooperative',
  plan: 'Primary production ledger',
  stats: [
    { label: 'Settled YTD', value: '£4.2m', hint: 'Audited monthly' },
    { label: 'Active carriers', value: '42', hint: 'UK & Western Europe' },
    { label: 'Dispute rate', value: '0.04%', hint: 'Within cooperative target' },
  ],
  accounts: [
    {
      id: 'acct_1001',
      name: 'Meridian Fleet Liquidity',
      category: 'Internal',
      balance: 1420500,
      status: 'Active',
      opened: '2021-03-12',
      ref: 'MFL-1001',
    },
    {
      id: 'acct_1002',
      name: 'Corridors Clearing Pool',
      category: 'Escrow',
      balance: 890400,
      status: 'Active',
      opened: '2022-01-18',
      ref: 'CCP-1002',
    },
    {
      id: 'acct_1003',
      name: 'Depot Reserve Fund',
      category: 'Reserve',
      balance: 310000,
      status: 'Active',
      opened: '2023-08-01',
      ref: 'DRF-1003',
    },
  ],
  transactions: [
    {
      id: 'txn_9011',
      date: '2026-10-26',
      counterparty: 'Dover Express Haulage',
      amount: 14200,
      direction: 'in',
      reference: 'CR-8821',
      status: 'Settled',
    },
    {
      id: 'txn_9010',
      date: '2026-10-26',
      counterparty: 'EuroTunnel Freight Consort',
      amount: 28400,
      direction: 'out',
      reference: 'DR-4910',
      status: 'Settled',
    },
    {
      id: 'txn_9009',
      date: '2026-10-25',
      counterparty: 'Midlands Intermodal Hub',
      amount: 7650,
      direction: 'in',
      reference: 'CR-8819',
      status: 'Settled',
    },
  ],
  activity: [
    {
      at: '2026-10-26T14:15:00Z',
      text: 'Batch CR-8821 reconciled against bank statement',
    },
    {
      at: '2026-10-26T11:00:00Z',
      text: 'Scheduled carrier disbursement completed successfully',
    },
  ],
};

export const SIMULATOR_SCENARIOS = {
  normal_typo: {
    key: 'normal_typo',
    title: 'Normal user, one typo',
    description: 'A legitimate user mistypes their password once, corrects it and continues without friction.',
    expect: 'Low risk · normal authentication',
    steps: [
      { at: 0, code: 'attempt_failed', route: 'login', identifierIndex: 0 },
      { at: 34, code: 'attempt_passed', route: 'login', identifierIndex: 0 },
    ],
  },
  forgetful_step_up: {
    key: 'forgetful_step_up',
    title: 'Forgetful user, step-up',
    description: 'Several spaced attempts, then the configured step-up factor completes the sign-in.',
    expect: 'Uncertain · step-up required',
    steps: [
      { at: 0, code: 'attempt_failed', route: 'login', identifierIndex: 0 },
      { at: 95, code: 'attempt_failed', route: 'login', identifierIndex: 0 },
      { at: 210, code: 'attempt_failed', route: 'login', identifierIndex: 0 },
      { at: 330, code: 'attempt_failed', route: 'login', identifierIndex: 0 },
      { at: 455, code: 'attempt_failed', route: 'login', identifierIndex: 0 },
      { at: 540, code: 'step_up_required', route: 'step_up' },
      { at: 612, code: 'step_up_passed', route: 'step_up' },
    ],
  },
  scripted_bursts: {
    key: 'scripted_bursts',
    title: 'Scripted burst',
    description: 'Regular bursts, rotating identifiers and probing of routes the app does not expose.',
    expect: 'High risk · isolated decoy',
    steps: [
      ...Array.from({ length: 12 }, (_, i) => ({
        at: i * 4,
        code: 'attempt_failed',
        route: 'login',
        identifierIndex: Math.floor(i / 2),
      })),
      { at: 50, code: 'route_probe', route: 'probe' },
      { at: 54, code: 'route_probe', route: 'probe' },
      { at: 58, code: 'session_reset', route: 'login' },
    ],
  },
  decoy_explorer: {
    key: 'decoy_explorer',
    title: 'Decoy explorer',
    description: 'A high-risk session lands in the decoy and works through synthetic accounts and settlements.',
    expect: 'High risk · decoy engagement recorded',
    steps: [
      ...Array.from({ length: 10 }, (_, i) => ({
        at: i * 3,
        code: 'attempt_failed',
        route: 'login',
        identifierIndex: Math.floor(i / 2),
      })),
      { at: 48, code: 'decoy_enter', route: 'login' },
      {
        at: 62,
        code: 'decoy_record_access',
        route: 'page',
        artifact: { id: 'dashboard', category: 'page' },
      },
      {
        at: 78,
        code: 'decoy_record_access',
        route: 'account',
        artifact: { id: 'acct_5510', category: 'account' },
      },
      {
        at: 91,
        code: 'decoy_record_access',
        route: 'account',
        artifact: { id: 'acct_5740', category: 'account' },
      },
      {
        at: 104,
        code: 'decoy_record_access',
        route: 'transaction',
        artifact: { id: 'txn_71204', category: 'transaction' },
      },
      {
        at: 116,
        code: 'decoy_record_access',
        route: 'account',
        artifact: { id: 'acct_5510', category: 'account' },
      },
      {
        at: 128,
        code: 'decoy_record_access',
        route: 'export',
        artifact: { id: 'settlements.csv', category: 'export' },
      },
      {
        at: 141,
        code: 'decoy_record_access',
        route: 'transaction',
        artifact: { id: 'txn_71190', category: 'transaction' },
      },
    ],
  },
};

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud_001',
    occurred_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    actor_email: 'secops-gateway@meridianfreight.example',
    actor_role: 'Security Engineer',
    action: 'POLICY_UPDATE',
    target_ref: 'policy-2026.10.1',
    change_summary: 'Enforced safe response mode: adaptive with thresholds (uncertain: 25, high: 62).',
  },
  {
    id: 'aud_002',
    occurred_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    actor_email: 'operator@meridianfreight.example',
    actor_role: 'Analyst',
    action: 'REVIEW_LABEL',
    target_ref: 'sess_99a8b1',
    change_summary: 'Labeled session sess_99a8b1 as suspicious: burst failure pattern matches credential spray profile.',
  },
  {
    id: 'aud_003',
    occurred_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    actor_email: 'operator@meridianfreight.example',
    actor_role: 'Lead Analyst',
    action: 'TELEMETRY_EXPORT',
    target_ref: 'export_csv_7d',
    change_summary: 'Exported 7-day redacted session metrics for security governance review.',
  },
];
