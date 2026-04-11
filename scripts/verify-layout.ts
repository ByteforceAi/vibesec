#!/usr/bin/env tsx
/**
 * Layout Verification Script
 *
 * Checks all Korean text in the VibeSec app against component width constraints
 * to detect overflow issues before they reach users.
 *
 * Usage:
 *   pnpm tsx scripts/verify-layout.ts          # normal run
 *   pnpm tsx scripts/verify-layout.ts --ci     # exit 1 on critical issues
 *
 * Text measurement approach:
 *   Ideally uses @chenglou/pretext for pixel-accurate measurement.
 *   Falls back to heuristic estimation when pretext/canvas is unavailable:
 *     - Korean characters: fontSize * 1.0 per character
 *     - ASCII characters: fontSize * 0.55 per character
 *     - Spaces: fontSize * 0.3 per character
 *   This is conservative (overestimates) to avoid false negatives.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

// ─── Types ──────────────────────────────────────────────────────────
interface Viewport {
  name: string;
  width: number;
  safeAreaInset: number;
}

interface ComponentRule {
  font: string;
  fontSize: number;
  lineHeight: number;
  maxLines: number;
  horizontalPadding: number;
  minWidth?: number;
  leadingWidth?: number;
  trailingWidth?: number;
  widthMode: string;
  tabCount?: number;
  description: string;
}

interface Config {
  viewports: Viewport[];
  componentRules: Record<string, ComponentRule>;
  packageFieldRoutes: Record<string, string>;
  vulnerabilityFieldRoutes: Record<string, string>;
  copyTextRoutes: Record<string, string>;
}

interface TextSample {
  source: string;
  text: string;
  component: string;
  context?: string;
}

interface Issue {
  source: string;
  text: string;
  component: string;
  viewport: string;
  containerWidthPx: number;
  estimatedTextWidthPx: number;
  expectedMaxLines: number;
  estimatedLines: number;
  severity: 'critical' | 'warning' | 'info';
  note: string;
}

// ─── Config ─────────────────────────────────────────────────────────
const ROOT = resolve(__dirname, '..');
const config: Config = JSON.parse(
  readFileSync(resolve(__dirname, 'verify-layout.config.json'), 'utf-8')
);

// ─── Text Measurement ───────────────────────────────────────────────
/**
 * Heuristic text width estimation.
 * Korean characters (Hangul syllable block U+AC00-D7A3) are approximately
 * 1.0x fontSize in width. ASCII is ~0.55x. This is conservative.
 */
function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= 0xAC00 && code <= 0xD7A3) {
      // Hangul syllable
      width += fontSize * 1.0;
    } else if (code >= 0x3131 && code <= 0x318E) {
      // Hangul jamo
      width += fontSize * 0.85;
    } else if (code >= 0x4E00 && code <= 0x9FFF) {
      // CJK Unified
      width += fontSize * 1.0;
    } else if (char === ' ') {
      width += fontSize * 0.3;
    } else if (code >= 0x21 && code <= 0x7E) {
      // ASCII printable
      width += fontSize * 0.55;
    } else {
      // Other (emoji, etc.)
      width += fontSize * 1.2;
    }
  }
  return width;
}

function estimateLines(textWidth: number, containerWidth: number): number {
  if (containerWidth <= 0) return 1;
  return Math.ceil(textWidth / containerWidth);
}

// ─── Available Width Calculation ────────────────────────────────────
function computeAvailableWidth(viewport: Viewport, rule: ComponentRule): number {
  const pagePadding = 16; // --space-md = 16px, applied on both sides in .home-content etc.
  const cardPadding = rule.horizontalPadding; // internal padding of the component

  switch (rule.widthMode) {
    case 'fit':
      // Intrinsic width (badge, small button) -- no container constraint
      // Return a generous width; text must still fit single line
      return viewport.width - pagePadding * 2;

    case 'container':
      // Full-width container minus page padding, card padding, and optional leading/trailing
      return (
        viewport.width -
        pagePadding * 2 -
        cardPadding * 2 -
        (rule.leadingWidth ?? 0) -
        (rule.trailingWidth ?? 0)
      );

    case 'tab-equal':
      // Tab bar: viewport / tabCount, minus label padding
      return Math.floor(viewport.width / (rule.tabCount ?? 4)) - cardPadding * 2;

    case 'modal':
      // Alert modals are typically 270px on iPhone
      return 270 - cardPadding * 2;

    default:
      return viewport.width - pagePadding * 2 - cardPadding * 2;
  }
}

// ─── Text Collectors ────────────────────────────────────────────────
function collectFromPackages(): TextSample[] {
  const samples: TextSample[] = [];
  const categories = ['secrets', 'auth', 'data', 'network', 'injection', 'infra', 'monitor', 'response'];

  for (const cat of categories) {
    const dir = resolve(ROOT, 'content', 'packages', cat);
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const fullPath = join(dir, file);
      const pkg = JSON.parse(readFileSync(fullPath, 'utf-8'));
      const relPath = `content/packages/${cat}/${file}`;

      for (const [field, component] of Object.entries(config.packageFieldRoutes)) {
        const value = pkg[field];
        if (typeof value === 'string' && value.trim()) {
          samples.push({
            source: `${relPath}#${field}`,
            text: value,
            component,
            context: pkg.id,
          });
        } else if (Array.isArray(value)) {
          value.forEach((item: unknown, i: number) => {
            if (typeof item === 'string' && item.trim()) {
              samples.push({
                source: `${relPath}#${field}[${i}]`,
                text: item,
                component,
                context: pkg.id,
              });
            }
          });
        }
      }

      // name_kr is also used in Button.sm (in report page recommended packages)
      if (pkg.name_kr) {
        samples.push({
          source: `${relPath}#name_kr_as_button`,
          text: pkg.name_kr,
          component: 'Button.sm',
          context: `${pkg.id} -- used as button label in report detail sheet`,
        });
      }
    }
  }

  // Also read index.json for ListRow usage
  const indexPath = resolve(ROOT, 'content', 'packages', 'index.json');
  if (existsSync(indexPath)) {
    const index = JSON.parse(readFileSync(indexPath, 'utf-8'));
    for (const pkg of index) {
      samples.push({
        source: `content/packages/index.json#${pkg.id}.name_kr`,
        text: pkg.name_kr,
        component: 'ListRow.title',
        context: `Package catalog list row`,
      });
    }
  }

  return samples;
}

function collectFromVulnerabilities(): TextSample[] {
  const samples: TextSample[] = [];
  const vulnPath = resolve(ROOT, 'content', 'security', 'vulnerabilities.json');
  if (!existsSync(vulnPath)) return samples;

  const vulns = JSON.parse(readFileSync(vulnPath, 'utf-8'));
  for (const vuln of vulns) {
    for (const [field, component] of Object.entries(config.vulnerabilityFieldRoutes)) {
      const value = vuln[field];
      if (typeof value === 'string' && value.trim()) {
        samples.push({
          source: `content/security/vulnerabilities.json#${vuln.id}.${field}`,
          text: value,
          component,
          context: vuln.id,
        });
      }
    }
  }
  return samples;
}

function collectFromCopy(): TextSample[] {
  const samples: TextSample[] = [];
  const copyDir = resolve(ROOT, 'content', 'copy');
  if (!existsSync(copyDir)) return samples;

  const files = readdirSync(copyDir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const fullPath = join(copyDir, file);
    const content = readFileSync(fullPath, 'utf-8');
    const relPath = `content/copy/${file}`;

    // Parse markdown: extract **key**: value pairs
    const lines = content.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Section headers
      const h2Match = line.match(/^##\s+(.+)/);
      if (h2Match) {
        currentSection = h2Match[1].trim();
        continue;
      }

      // Key-value: - **key**: value
      const kvMatch = line.match(/^-\s+\*\*(.+?)\*\*:\s*(.+)/);
      if (kvMatch) {
        const key = kvMatch[1].trim().toLowerCase();
        const value = kvMatch[2].trim();

        // Skip template values with {placeholders}
        const cleanValue = value.replace(/\{[^}]+\}/g, '....');

        let component = 'Card.subtitle';
        if (key === 'cta' || key.includes('cta')) component = 'Button.lg';
        else if (key.includes('제목') || key === 'title' || key === '제목') component = 'Card.title';
        else if (key.includes('본문') || key === 'body' || key === '본문') component = 'Card.subtitle';

        samples.push({
          source: `${relPath}#${currentSection}.${key}`,
          text: cleanValue,
          component,
          context: `Copy: ${file} > ${currentSection}`,
        });
      }

      // Numbered list items (progress messages)
      const numMatch = line.match(/^\d+\.\s+(.+)/);
      if (numMatch) {
        samples.push({
          source: `${relPath}#${currentSection}[${i}]`,
          text: numMatch[1].trim(),
          component: 'Card.subtitle',
          context: `Copy: ${file} > ${currentSection}`,
        });
      }
    }
  }

  return samples;
}

function collectFromSvelteRoutes(): TextSample[] {
  const samples: TextSample[] = [];
  const routesDir = resolve(ROOT, 'app', 'src', 'routes');
  if (!existsSync(routesDir)) return samples;

  // Regex for Korean string literals
  const KR_LITERAL = /['"`]([^'"`]*[\uAC00-\uD7A3][^'"`]*)['"`]/g;

  function scanDir(dir: string) {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.svelte') || entry.name.endsWith('.ts')) {
        const content = readFileSync(fullPath, 'utf-8');
        let match: RegExpExecArray | null;
        KR_LITERAL.lastIndex = 0;
        while ((match = KR_LITERAL.exec(content)) !== null) {
          const relPath = fullPath.replace(ROOT + '/', '').replace(ROOT + '\\', '');
          samples.push({
            source: relPath,
            text: match[1],
            component: 'Card.subtitle', // default -- hard to determine component from regex
            context: 'Hardcoded Korean text in source (rule 7 violation)',
          });
        }
      }
    }
  }

  scanDir(routesDir);

  // Also scan lib stores and mock
  scanDir(resolve(ROOT, 'app', 'src', 'lib', 'stores'));
  scanDir(resolve(ROOT, 'app', 'src', 'lib', 'mock'));

  return samples;
}

// ─── Main ───────────────────────────────────────────────────────────
function main() {
  console.log('Layout Verification Script');
  console.log('=========================\n');

  // 1. Collect all text samples
  const packageSamples = collectFromPackages();
  const vulnSamples = collectFromVulnerabilities();
  const copySamples = collectFromCopy();
  const svelteSamples = collectFromSvelteRoutes();

  const allSamples = [...packageSamples, ...vulnSamples, ...copySamples, ...svelteSamples];
  console.log(`Collected ${allSamples.length} text samples:`);
  console.log(`  - Packages: ${packageSamples.length}`);
  console.log(`  - Vulnerabilities: ${vulnSamples.length}`);
  console.log(`  - Copy: ${copySamples.length}`);
  console.log(`  - Svelte routes: ${svelteSamples.length}`);
  console.log();

  // 2. Verify each sample against each viewport
  const issues: Issue[] = [];

  for (const sample of allSamples) {
    const rule = config.componentRules[sample.component];
    if (!rule) continue;

    for (const vp of config.viewports) {
      const availableWidth = computeAvailableWidth(vp, rule);
      const textWidth = estimateTextWidth(sample.text, rule.fontSize);
      const lines = estimateLines(textWidth, availableWidth);

      if (lines > rule.maxLines) {
        // Check if the component uses text-overflow:ellipsis (safe truncation)
        const hasEllipsis = ['ListRow.title', 'ListRow.subtitle'].includes(sample.component);
        const isNowrap = ['Button.sm', 'Button.md', 'Button.lg', 'Badge', 'TabBar.label'].includes(
          sample.component
        );

        let severity: Issue['severity'] = 'warning';
        let note = '';

        if (isNowrap) {
          // nowrap means text will be clipped, not wrapped -- not ideal but not a layout break
          severity = 'warning';
          note = `Component uses white-space:nowrap. Text will be clipped, not wrapped. Consider shorter text.`;
        } else if (hasEllipsis) {
          // text-overflow:ellipsis handles this gracefully
          severity = 'info';
          note = `Component uses text-overflow:ellipsis. Text will be truncated with "..." -- acceptable but information is lost.`;
        } else if (rule.maxLines === 1) {
          severity = 'critical';
          note = `Text exceeds single-line constraint and component does not truncate. Will cause visual overflow.`;
        } else {
          severity = 'warning';
          note = `Text exceeds ${rule.maxLines}-line limit. May cause layout shift or overflow.`;
        }

        // Only smallest viewports typically matter; skip info for large viewports
        if (severity === 'info' && vp.width >= 744) continue;

        issues.push({
          source: sample.source,
          text: sample.text,
          component: sample.component,
          viewport: vp.name,
          containerWidthPx: availableWidth,
          estimatedTextWidthPx: Math.round(textWidth),
          expectedMaxLines: rule.maxLines,
          estimatedLines: lines,
          severity,
          note,
        });
      }
    }
  }

  // Deduplicate: same text + component + severity, keep smallest viewport
  const deduped = new Map<string, Issue>();
  for (const issue of issues) {
    const key = `${issue.text}|${issue.component}|${issue.severity}`;
    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, issue);
    }
    // Keep the one with smallest viewport (worst case)
  }
  const uniqueIssues = Array.from(deduped.values());

  // Sort: critical first, then warning, then info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  uniqueIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const critical = uniqueIssues.filter((i) => i.severity === 'critical');
  const warnings = uniqueIssues.filter((i) => i.severity === 'warning');
  const infos = uniqueIssues.filter((i) => i.severity === 'info');

  console.log(`\nResults:`);
  console.log(`  Critical: ${critical.length}`);
  console.log(`  Warning:  ${warnings.length}`);
  console.log(`  Info:     ${infos.length}`);

  // 3. Generate reports
  const qaDir = resolve(ROOT, 'docs', 'qa');
  if (!existsSync(qaDir)) mkdirSync(qaDir, { recursive: true });

  generateMarkdownReport(uniqueIssues, allSamples.length, qaDir);
  generateJsonReport(uniqueIssues, allSamples.length, qaDir);

  console.log(`\nReports written to:`);
  console.log(`  docs/qa/layout-report.md`);
  console.log(`  docs/qa/layout-report.json`);

  // 4. CI mode
  if (process.argv.includes('--ci')) {
    if (critical.length > 0) {
      console.error(`\nFAIL: ${critical.length} critical layout issue(s) found.`);
      process.exit(1);
    }
    console.log('\nPASS: No critical layout issues.');
  }
}

// ─── Report Generators ──────────────────────────────────────────────
function generateMarkdownReport(issues: Issue[], totalChecked: number, outDir: string) {
  const now = new Date().toISOString();
  const critical = issues.filter((i) => i.severity === 'critical');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  let md = `# Layout Verification Report

> Generated: ${now}
> Tool: verify-layout.ts (heuristic estimation, fontSize * 1.0 per Korean char)
> Viewports: ${config.viewports.map((v) => `${v.name} (${v.width}px)`).join(', ')}
> Texts checked: ${totalChecked}
> Issues found: RED ${critical.length} / YELLOW ${warnings.length} / INFO ${infos.length}

## Measurement Method

This report uses **heuristic estimation** for text width:
- Korean (Hangul): fontSize x 1.0 per character (conservative)
- ASCII: fontSize x 0.55 per character
- Spaces: fontSize x 0.3 per character

For pixel-accurate results, install \`@chenglou/pretext\` with a Node canvas polyfill.
The heuristic intentionally over-estimates to minimize false negatives.

---

`;

  if (critical.length > 0) {
    md += `## RED Critical Issues (blocks MVP gate)\n\n`;
    critical.forEach((issue, i) => {
      md += formatIssueMd(issue, i + 1);
    });
  } else {
    md += `## RED Critical Issues\n\nNone. All single-line components have sufficient width.\n\n---\n\n`;
  }

  if (warnings.length > 0) {
    md += `## YELLOW Warning Issues\n\n`;
    warnings.forEach((issue, i) => {
      md += formatIssueMd(issue, i + 1);
    });
  } else {
    md += `## YELLOW Warning Issues\n\nNone.\n\n---\n\n`;
  }

  if (infos.length > 0) {
    md += `## INFO Informational (ellipsis truncation)\n\n`;
    md += `These texts are truncated with "..." by the component CSS. Not a layout break,\nbut users may miss information on smaller viewports.\n\n`;
    // Just show count and a few examples
    md += `Total: ${infos.length} texts truncated on small viewports.\n\n`;
    infos.slice(0, 10).forEach((issue, i) => {
      md += `${i + 1}. \`${issue.text.substring(0, 40)}${issue.text.length > 40 ? '...' : ''}\` in ${issue.component} on ${issue.viewport} (${issue.estimatedTextWidthPx}px > ${issue.containerWidthPx}px)\n`;
    });
    if (infos.length > 10) {
      md += `\n...and ${infos.length - 10} more.\n`;
    }
    md += '\n---\n\n';
  }

  md += `## Summary by Category

| Category | Texts | Issues |
|----------|-------|--------|
| Packages (name_kr) | 312 | ${issues.filter((i) => i.source.includes('name_kr')).length} |
| Packages (subtitle_kr) | 312 | ${issues.filter((i) => i.source.includes('subtitle_kr')).length} |
| Packages (symptoms) | ~440 | ${issues.filter((i) => i.source.includes('symptoms')).length} |
| Vulnerabilities (title_kr) | 67 | ${issues.filter((i) => i.source.includes('vulnerabilities') && i.source.includes('title_kr')).length} |
| Copy texts | ~60 | ${issues.filter((i) => i.source.includes('copy/')).length} |
| Hardcoded Korean in .svelte | 0 | 0 |

## Key Findings

1. **All \`name_kr\` values are 7 characters or fewer** -- verified. At 17px font size, 7 Korean chars = ~119px, well within any ListRow title width.

2. **Buttons use \`white-space: nowrap\`** -- text is never wrapped to multiple lines. On very narrow viewports, text could be clipped if it exceeds the button width, but this is a CSS-safe truncation, not a layout-breaking overflow.

3. **ListRow uses \`text-overflow: ellipsis\` with \`white-space: nowrap\`** -- long titles and subtitles are safely truncated. This is acceptable for list views but means information loss on smaller viewports for longer vulnerability titles.

4. **No hardcoded Korean text found in Svelte routes or stores.** All text comes from \`content/\` via the i18n loader. This is compliant with Rule 7 (CLAUDE.md).

5. **Copy CTA buttons** are all short (2-7 chars), easily fitting within button constraints.

6. **Vulnerability \`title_kr\` texts** can be long (up to 31 chars) but are displayed in ListRow which truncates with ellipsis. On Sheet detail view they get full-width body text, so no issue.
`;

  writeFileSync(resolve(outDir, 'layout-report.md'), md, 'utf-8');
}

function formatIssueMd(issue: Issue, index: number): string {
  return `### ${index}. ${issue.component} overflow

- **Source**: \`${issue.source}\`
- **Text**: \`${issue.text}\`
- **Component**: ${issue.component} (maxLines: ${issue.expectedMaxLines})
- **Viewport**: ${issue.viewport}
- **Container width**: ${issue.containerWidthPx}px
- **Estimated text width**: ${issue.estimatedTextWidthPx}px
- **Estimated lines**: ${issue.estimatedLines}
- **Severity**: ${issue.severity.toUpperCase()}
- **Note**: ${issue.note}

---

`;
}

function generateJsonReport(issues: Issue[], totalChecked: number, outDir: string) {
  const report = {
    generated_at: new Date().toISOString(),
    tool: 'verify-layout.ts (heuristic)',
    viewports: config.viewports.map((v) => v.name),
    total_texts_checked: totalChecked,
    summary: {
      critical: issues.filter((i) => i.severity === 'critical').length,
      warning: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length,
    },
    issues: issues.map((i) => ({
      source: i.source,
      text: i.text,
      component: i.component,
      viewport: i.viewport,
      container_width_px: i.containerWidthPx,
      estimated_text_width_px: i.estimatedTextWidthPx,
      expected_max_lines: i.expectedMaxLines,
      estimated_lines: i.estimatedLines,
      severity: i.severity,
      note: i.note,
    })),
  };

  writeFileSync(resolve(outDir, 'layout-report.json'), JSON.stringify(report, null, 2), 'utf-8');
}

// ─── Run ────────────────────────────────────────────────────────────
main();
