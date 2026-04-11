/**
 * Fake Scanner
 *
 * Simulates a security scan by picking random vulnerabilities
 * from content/security/vulnerabilities.json and matching packages
 * from content/packages/index.json.
 *
 * Returns a ScanResult after a realistic delay with progress callbacks.
 */

import type { ScanResult, Finding, ScanSummary } from '$lib/stores/scan';

// Import data at build time
import vulnsData from '$content/security/vulnerabilities.json';
import packagesIndex from '$content/packages/index.json';

interface RawVuln {
  id: string;
  slug: string;
  title_kr: string;
  metaphor_kr: string;
  severity: string;
  category: string;
  how_to_detect: string;
  example_damage_kr: string;
  recommended_packages: string[];
}

interface RawPackage {
  id: string;
  category: string;
  name: string;
  name_kr: string;
  price_krw: number;
  severity: string;
}

const allVulns = vulnsData as RawVuln[];
const allPackages = packagesIndex as RawPackage[];

// ---- Utilities ----

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  // Simple UUID-like ID without crypto dependency for SSR safety
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) id += '-';
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}

function mapSeverityToFinding(sev: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  switch (sev) {
    case 'critical': return 'critical';
    case 'high': return 'high';
    case 'medium': return 'medium';
    case 'low': return 'low';
    default: return 'info';
  }
}

function collectRecommendedPackages(vulns: RawVuln[]): string[] {
  const pkgIds = new Set<string>();
  for (const v of vulns) {
    for (const pkgId of v.recommended_packages) {
      pkgIds.add(pkgId);
    }
  }
  // Also add some packages from the same categories
  const categories = new Set(vulns.map((v) => v.category));
  const extraPkgs = allPackages
    .filter((p) => categories.has(p.category))
    .slice(0, 5);
  for (const p of extraPkgs) {
    pkgIds.add(p.id);
  }
  return Array.from(pkgIds).slice(0, 8);
}

// ---- Main Scanner ----

export type ProgressCallback = (progress: number, message: string) => void;

/**
 * Perform a fake scan on the given target URL.
 * Calls onProgress periodically to update UI.
 * Returns a ScanResult after ~3-5 seconds.
 */
export async function fakeScan(
  target: string,
  progressMessages: string[],
  onProgress?: ProgressCallback,
): Promise<ScanResult> {
  const scanId = generateId();
  const startedAt = new Date().toISOString();
  const findingCount = randomInt(5, 12);
  const selectedVulns = pickRandom(allVulns, findingCount);

  // Default progress messages if none provided
  const messages = progressMessages.length > 0 ? progressMessages : [
    '...',
  ];

  // Simulate progress over ~3 seconds
  const totalSteps = messages.length;
  for (let i = 0; i < totalSteps; i++) {
    const progress = (i + 1) / totalSteps;
    const message = messages[i % messages.length];
    onProgress?.(progress * 0.9, message); // Reserve last 10% for finalization
    await sleep(300 + randomInt(100, 400));
  }

  // Final step
  onProgress?.(0.95, messages[messages.length - 1]);
  await sleep(500);

  // Build findings
  const findings: Finding[] = selectedVulns.map((v, idx) => ({
    id: `FIND-${scanId.slice(0, 8)}-${String(idx + 1).padStart(3, '0')}`,
    vulnId: v.id,
    severity: mapSeverityToFinding(v.severity),
    title_kr: v.title_kr,
    description_kr: v.metaphor_kr,
    location: target,
    recommendedPackageIds: v.recommended_packages,
  }));

  // Sort by severity
  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Compute summary
  const summary: ScanSummary = {
    critical: findings.filter((f) => f.severity === 'critical' || f.severity === 'high').length,
    warning: findings.filter((f) => f.severity === 'medium').length,
    ok: findings.filter((f) => f.severity === 'low' || f.severity === 'info').length,
    total: findings.length,
  };

  const recommendedPackageIds = collectRecommendedPackages(selectedVulns);

  // Status message based on findings
  let statusMessage_kr: string;
  if (summary.critical === 0 && summary.warning === 0) {
    statusMessage_kr = '';
  } else if (summary.critical > 0) {
    statusMessage_kr = '';
  } else {
    statusMessage_kr = '';
  }
  // Note: actual Korean copy will be resolved at render time from content/copy

  onProgress?.(1.0, '');

  const result: ScanResult = {
    scanId,
    target,
    startedAt,
    finishedAt: new Date().toISOString(),
    summary,
    findings,
    recommendedPackageIds,
    statusMessage_kr,
  };

  return result;
}
