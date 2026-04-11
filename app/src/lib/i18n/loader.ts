/**
 * i18n Loader
 *
 * Loads copy from content/copy/*.md files and parses them into key-value maps.
 * All Korean UI text lives in content/ — never hardcoded in routes or components.
 *
 * Copy files use a simple markdown format:
 *   ## Section Name
 *   - **key**: value
 *
 * This loader parses that into { 'section.key': 'value' } maps.
 */

// Import raw markdown copy files at build time via Vite
const copyModules = import.meta.glob('$content/copy/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

interface CopyMap {
  [key: string]: string;
}

/**
 * Parse a markdown copy file into a flat key-value map.
 * Format: ## Section -> - **key**: value
 */
function parseCopyMd(raw: string): CopyMap {
  const map: CopyMap = {};
  let currentSection = '';

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();

    // Section header: ## Section Name
    const sectionMatch = trimmed.match(/^#{1,3}\s+(.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1]
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\uAC00-\uD7A3\u3131-\u3163]+/g, '_')
        .replace(/^_|_$/g, '');
      continue;
    }

    // Key-value: - **key**: value
    const kvMatch = trimmed.match(/^-\s+\*\*(.+?)\*\*:\s*(.+)/);
    if (kvMatch && currentSection) {
      const key = kvMatch[1]
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\uAC00-\uD7A3\u3131-\u3163]+/g, '_')
        .replace(/^_|_$/g, '');
      const value = kvMatch[2].trim();
      map[`${currentSection}.${key}`] = value;
      continue;
    }

    // Numbered list: N. text (for progress messages)
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch && currentSection) {
      const idx = numberedMatch[1];
      map[`${currentSection}.${idx}`] = numberedMatch[2].trim();
      continue;
    }
  }

  return map;
}

// Pre-parsed copy maps by file name
const copyCache: Record<string, CopyMap> = {};

function getCopyForFile(filename: string): CopyMap {
  if (copyCache[filename]) return copyCache[filename];

  // Find the module matching this filename
  for (const [path, raw] of Object.entries(copyModules)) {
    const name = path.split('/').pop()?.replace('.md', '') ?? '';
    if (name === filename) {
      copyCache[filename] = parseCopyMd(raw);
      return copyCache[filename];
    }
  }

  copyCache[filename] = {};
  return copyCache[filename];
}

/**
 * Get a translated copy string.
 * @param path - dot-separated path: "filename.section.key"
 *   e.g. "onboarding.step_1_welcome.title" -> content/copy/onboarding.md > ## Step 1 Welcome > **title**
 * @param fallback - fallback if key not found
 */
export function t(path: string, fallback = ''): string {
  const parts = path.split('.');
  if (parts.length < 3) return fallback;

  const filename = parts[0];
  const rest = parts.slice(1).join('.');
  const map = getCopyForFile(filename);
  return map[rest] ?? fallback;
}

/**
 * Get all copy for a file as a flat map.
 */
export function getCopy(filename: string): CopyMap {
  return getCopyForFile(filename);
}

/**
 * Get all values matching a section prefix.
 * Useful for getting all progress messages.
 */
export function getSection(filename: string, section: string): string[] {
  const map = getCopyForFile(filename);
  const prefix = section + '.';
  return Object.entries(map)
    .filter(([k]) => k.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, v]) => v);
}
