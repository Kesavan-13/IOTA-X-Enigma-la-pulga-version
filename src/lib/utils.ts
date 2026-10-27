import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Decision, ResponseMode, ReviewLabel, RiskTier, SessionStatus } from '../types/gateway';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const tierMeta: Record<RiskTier, { label: string; chip: string; dot: string; text: string }> = {
  low: {
    label: 'Low risk',
    chip: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
    dot: 'bg-teal-400',
    text: 'text-teal-300',
  },
  uncertain: {
    label: 'Uncertain',
    chip: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
  },
  high: {
    label: 'High risk',
    chip: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    dot: 'bg-orange-400',
    text: 'text-orange-300',
  },
};

export const decisionMeta: Record<Decision, { label: string; chip: string }> = {
  allow: {
    label: 'Continue',
    chip: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
  },
  step_up: {
    label: 'Step-up',
    chip: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  decoy: {
    label: 'Decoy',
    chip: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  },
};

export const reviewMeta: Record<ReviewLabel, { label: string; chip: string }> = {
  unreviewed: {
    label: 'Unreviewed',
    chip: 'border-white/10 bg-white/5 text-slate-300',
  },
  likely_legitimate: {
    label: 'Likely legitimate',
    chip: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
  },
  suspicious: {
    label: 'Suspicious',
    chip: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  },
  inconclusive: {
    label: 'Inconclusive',
    chip: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
};

export const statusMeta: Record<SessionStatus, string> = {
  active: 'In progress',
  authenticated: 'Authenticated',
  stepped_up: 'Step-up passed',
  in_decoy: 'In decoy',
  expired: 'Expired',
};

export const eventMeta: Record<string, string> = {
  attempt_failed: 'Attempt failed',
  attempt_passed: 'Credentials accepted',
  neutral_response: 'Neutral response',
  throttled: 'Throttled',
  step_up_required: 'Step-up required',
  step_up_passed: 'Step-up passed',
  step_up_failed: 'Step-up failed',
  recovery_verified: 'Owner recovery verified',
  decoy_enter: 'Entered decoy',
  decoy_view: 'Decoy page view',
  decoy_record_access: 'Decoy record access',
  session_reset: 'Session continuity change',
  route_probe: 'Route probe',
};

export const eventColorMeta: Record<string, string> = {
  attempt_failed: 'text-orange-300',
  attempt_passed: 'text-teal-300',
  neutral_response: 'text-slate-300',
  throttled: 'text-amber-300',
  step_up_required: 'text-amber-300',
  step_up_passed: 'text-teal-300',
  step_up_failed: 'text-orange-300',
  recovery_verified: 'text-teal-300',
  decoy_enter: 'text-orange-300',
  decoy_view: 'text-orange-200',
  decoy_record_access: 'text-orange-200',
  session_reset: 'text-amber-300',
  route_probe: 'text-amber-300',
};

export const modeMeta: Record<ResponseMode, string> = {
  monitor: 'Monitor',
  challenge: 'Challenge',
  adaptive: 'Adaptive',
};

export function formatDateUTC(dateString?: string): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString('en-GB', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.round(diff / 60000);
    if (Math.abs(minutes) < 1) return 'just now';
    if (Math.abs(minutes) < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  } catch {
    return '—';
  }
}

export function formatCurrencyGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}
