import { sanitizeEntries, type SearchEntry } from './search-match';

const INDEX_URL = '/search-index.json';
const INDEX_VERSION = 1;
const MAX_ENTRIES = 1000;

/**
 * Fetches the static search index from the same origin. Any failure (network error,
 * non-2xx status, malformed JSON, wrong version) yields an empty list so the dialog
 * degrades to "no results" instead of breaking (M-03). Each entry is re-validated
 * after parsing because the file can change after the build (M-01).
 */
export async function loadSearchIndex(fetchFn: typeof fetch = fetch): Promise<SearchEntry[]> {
  try {
    const response = await fetchFn(INDEX_URL, { credentials: 'same-origin' });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return [];
    const record = data as Record<string, unknown>;
    if (record['version'] !== INDEX_VERSION) return [];
    return sanitizeEntries(record['entries']).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}
