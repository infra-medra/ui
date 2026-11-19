/**
 * Generates `public/search-index.json`, the static index the search dialog fetches
 * same-origin. Entries are derived only from `site-nav.ts` (title, section, group, url),
 * so no other file or secret can reach the index (M-02). Every entry is checked against
 * the same rules as `src/content/search-index.schema.json` before it is written (M-01).
 *
 * Run from `projects/site`: `npm run generate:search-index`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { SECTIONS, itemUrl } from '../src/app/nav/site-nav';
import { isValidEntry, type SearchEntry } from '../src/app/search/search-match';

export interface SearchIndex {
  version: 1;
  entries: SearchEntry[];
}

/** Builds the index from the navigation model; throws if any entry breaks the contract. */
export function buildSearchIndex(): SearchIndex {
  const entries: SearchEntry[] = [];
  for (const section of SECTIONS) {
    for (const group of section.groups) {
      for (const item of group.items) {
        const entry = {
          title: item.label,
          section: section.id,
          group: group.label,
          url: itemUrl(section, item),
        };
        if (!isValidEntry(entry)) {
          throw new Error(`Invalid search index entry: ${JSON.stringify(entry)}`);
        }
        entries.push(entry);
      }
    }
  }
  return { version: 1, entries };
}

function main(): void {
  const out = resolve(process.cwd(), 'public/search-index.json');
  mkdirSync(dirname(out), { recursive: true });
  const index = buildSearchIndex();
  writeFileSync(out, JSON.stringify(index) + '\n', 'utf8');
  console.log(`Wrote ${index.entries.length} search entries to ${out}`);
}

if (process.argv[1]?.endsWith('generate-search-index.mts')) main();
