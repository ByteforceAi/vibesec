/**
 * Scan State Store
 *
 * Manages the scan lifecycle: idle -> scanning -> complete -> error
 * Persists scan history to localStorage.
 */

import { writable, derived } from 'svelte/store';

// ---- Types (aligned with docs/arch/schema.md) ----

export interface Finding {
  id: string;
  vulnId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title_kr: string;
  description_kr: string;
  location: string;
  recommendedPackageIds: string[];
}

export interface ScanSummary {
  critical: number;
  warning: number;
  ok: number;
  total: number;
}

export interface ScanResult {
  scanId: string;
  target: string;
  startedAt: string;
  finishedAt: string;
  summary: ScanSummary;
  findings: Finding[];
  recommendedPackageIds: string[];
  statusMessage_kr: string;
}

export type ScanStatus = 'idle' | 'scanning' | 'complete' | 'error';

interface ScanState {
  status: ScanStatus;
  progress: number;
  progressMessage: string;
  result: ScanResult | null;
  error: string | null;
}

// ---- Store ----

const HISTORY_KEY = 'vibesec_scan_history';

function loadHistory(): ScanResult[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: ScanResult[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    // Keep last 20 scans
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  } catch {
    // Storage full or unavailable
  }
}

const initialState: ScanState = {
  status: 'idle',
  progress: 0,
  progressMessage: '',
  result: null,
  error: null,
};

export const scanState = writable<ScanState>(initialState);
export const scanHistory = writable<ScanResult[]>(loadHistory());

// Derived stores for convenience
export const scanStatus = derived(scanState, ($s) => $s.status);
export const scanProgress = derived(scanState, ($s) => $s.progress);
export const scanResult = derived(scanState, ($s) => $s.result);

// ---- Actions ----

export function startScan(): void {
  scanState.set({
    status: 'scanning',
    progress: 0,
    progressMessage: '',
    result: null,
    error: null,
  });
}

export function updateProgress(progress: number, message: string): void {
  scanState.update((s) => ({
    ...s,
    progress: Math.max(0, Math.min(1, progress)),
    progressMessage: message,
  }));
}

export function completeScan(result: ScanResult): void {
  scanState.set({
    status: 'complete',
    progress: 1,
    progressMessage: '',
    result,
    error: null,
  });

  // Add to history
  scanHistory.update((history) => {
    const updated = [result, ...history.filter((h) => h.scanId !== result.scanId)];
    saveHistory(updated);
    return updated;
  });
}

export function failScan(error: string): void {
  scanState.update((s) => ({
    ...s,
    status: 'error',
    error,
  }));
}

export function resetScan(): void {
  scanState.set(initialState);
}

export function getScanById(scanId: string): ScanResult | undefined {
  let result: ScanResult | undefined;
  scanHistory.subscribe((history) => {
    result = history.find((h) => h.scanId === scanId);
  })();
  return result;
}
