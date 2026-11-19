/**
 * Pure search over the static docs index. No Angular imports so it can run under Jest.
 * Queries are compared as plain lowercase text; they are never compiled to a RegExp
 * and never turned into markup (M-04).
 */

export type SearchSection = 'getting-started' | 'foundations' | 'components' | 'guides' | 'reference';

export interface SearchEntry {
  title: string;
  section: SearchSection;
  group: string;
  url: string;
}

const SECTIONS: readonly string[] = ['getting-started', 'foundations', 'components', 'guides', 'reference'];
const ENTRY_KEYS: readonly string[] = ['title', 'section', 'group', 'url'];
const URL_RULE = /^\/(?!\/)[A-Za-z0-9/_-]*$/;
const MAX_TEXT = 120;
const MAX_URL = 200;
const MAX_QUERY = 200;
const DEFAULT_LIMIT = 20;

function boundedText(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= MAX_TEXT;
}

/** Same rules as `src/content/search-index.schema.json`, applied to every entry on the client (M-01). */
export function isValidEntry(value: unknown): value is SearchEntry {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  if (keys.length !== ENTRY_KEYS.length || !keys.every((k) => ENTRY_KEYS.includes(k))) return false;
  const e = value as Record<string, unknown>;
  return (
    boundedText(e['title']) &&
    boundedText(e['group']) &&
    typeof e['section'] === 'string' &&
    SECTIONS.includes(e['section']) &&
    typeof e['url'] === 'string' &&
    e['url'].length <= MAX_URL &&
    URL_RULE.test(e['url'])
  );
}

/** Keeps only valid entries; anything that is not an array yields an empty list (M-03). */
export function sanitizeEntries(value: unknown): SearchEntry[] {
  return Array.isArray(value) ? value.filter(isValidEntry) : [];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s_-]+/g, '');
}

function score(entry: SearchEntry, query: string): number {
  const title = normalize(entry.title);
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (title.includes(query)) return 2;
  if (normalize(entry.group).includes(query)) return 3;
  if (normalize(entry.section).includes(query)) return 4;
  return -1;
}

/** Ranks entries by title (exact, prefix, substring), then group, then section. */
export function searchEntries(entries: readonly SearchEntry[], query: string, limit = DEFAULT_LIMIT): SearchEntry[] {
  const q = normalize(query.slice(0, MAX_QUERY));
  if (q === '') return [];
  return entries
    .map((entry, index) => ({ entry, index, rank: score(entry, q) }))
    .filter((r) => r.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, Math.max(0, limit))
    .map((r) => r.entry);
}
