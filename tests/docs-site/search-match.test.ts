import {
  isValidEntry,
  sanitizeEntries,
  searchEntries,
  type SearchEntry,
} from '../../projects/site/src/app/search/search-match';

const entry = (title: string, url: string, group = 'Form / input', section = 'components'): SearchEntry => ({
  title,
  section: section as SearchEntry['section'],
  group,
  url,
});

const entries: SearchEntry[] = [
  entry('DataTable', '/docs/components/data-table', 'Data'),
  entry('Button', '/docs/components/button', 'Buttons / actions'),
  entry('ButtonGroup', '/docs/components/button-group', 'Buttons / actions'),
  entry('SplitButton', '/docs/components/split-button', 'Buttons / actions'),
  entry('Installation', '/docs/getting-started/installation', 'Setup', 'getting-started'),
  entry('Theming', '/docs/foundations/theming', 'Foundations', 'foundations'),
];

describe('search-match', () => {
  describe('searchEntries', () => {
    // SITE-012.S2 (supporting): "datatable" finds the DataTable page first
    it('finds a component by a case-insensitive title match', () => {
      const results = searchEntries(entries, 'datatable');
      expect(results[0].url).toBe('/docs/components/data-table');
    });

    it('ranks exact matches before prefix matches before substring matches', () => {
      const results = searchEntries(entries, 'button').map((e) => e.title);
      expect(results).toEqual(['Button', 'ButtonGroup', 'SplitButton']);
    });

    it('matches on section and group text too', () => {
      const results = searchEntries(entries, 'foundations');
      expect(results.map((e) => e.title)).toContain('Theming');
    });

    it('returns an empty list for an empty or whitespace-only query', () => {
      expect(searchEntries(entries, '')).toEqual([]);
      expect(searchEntries(entries, '   ')).toEqual([]);
    });

    it('returns an empty list when nothing matches', () => {
      expect(searchEntries(entries, 'zzzzzz')).toEqual([]);
    });

    it('caps the number of results at the limit', () => {
      expect(searchEntries(entries, 'button', 2)).toHaveLength(2);
    });

    it('does not mutate the input array', () => {
      const copy = entries.map((e) => ({ ...e }));
      searchEntries(entries, 'button');
      expect(entries).toEqual(copy);
    });
  });

  describe('hostile queries (SITE-012.S4)', () => {
    const hostile = [
      '<img src=x onerror=alert(1)>',
      '<script>alert(1)</script>',
      'javascript:alert(1)',
      '.*',
      '(((',
      '[',
      '\\',
      '$&',
      '__proto__',
      'constructor',
      'a'.repeat(100_000),
    ];

    it.each(hostile)('treats %s as plain text without throwing', (query) => {
      expect(() => searchEntries(entries, query)).not.toThrow();
      expect(searchEntries(entries, query)).toEqual([]);
    });

    it('does not interpret regular expression syntax', () => {
      expect(searchEntries(entries, 'but.*')).toEqual([]);
    });

    it('never returns data derived from the query', () => {
      const query = '<img src=x onerror=alert(1)>';
      const results = searchEntries(entries, query);
      expect(JSON.stringify(results)).not.toContain('onerror');
    });
  });

  describe('isValidEntry (M-01)', () => {
    it('accepts a well-formed entry', () => {
      expect(isValidEntry(entry('Button', '/docs/components/button'))).toBe(true);
    });

    it.each(['//evil.example', '/\\evil.example', 'https://evil.example', 'javascript:alert(1)', 'docs/button', '/a b', '/a?x=1', '/a#x', ''])(
      'rejects the url %j',
      (url) => {
        expect(isValidEntry(entry('Button', url))).toBe(false);
      },
    );

    it('rejects urls longer than 200 characters', () => {
      expect(isValidEntry(entry('Button', '/' + 'a'.repeat(200)))).toBe(false);
    });

    it('rejects titles that are empty or longer than 120 characters', () => {
      expect(isValidEntry(entry('', '/a'))).toBe(false);
      expect(isValidEntry(entry('x'.repeat(121), '/a'))).toBe(false);
    });

    it('rejects groups that are empty or longer than 120 characters', () => {
      expect(isValidEntry(entry('A', '/a', ''))).toBe(false);
      expect(isValidEntry(entry('A', '/a', 'g'.repeat(121)))).toBe(false);
    });

    it('rejects an unknown section', () => {
      expect(isValidEntry(entry('A', '/a', 'G', 'admin'))).toBe(false);
    });

    it('rejects entries with extra properties', () => {
      expect(isValidEntry({ ...entry('A', '/a'), extra: 1 })).toBe(false);
    });

    it.each([null, undefined, 42, 'str', [], { title: 1 }, { title: 'A', section: 'components', group: 'G' }])(
      'rejects the non-entry value %j',
      (value) => {
        expect(isValidEntry(value)).toBe(false);
      },
    );
  });

  describe('sanitizeEntries (M-01, M-03)', () => {
    it('drops invalid entries and keeps valid ones', () => {
      const result = sanitizeEntries([
        entry('Good', '/docs/good'),
        entry('Evil', '//evil.example'),
        entry('Backslash', '/\\evil.example'),
        null,
        'junk',
      ]);
      expect(result.map((e) => e.title)).toEqual(['Good']);
    });

    it.each([null, undefined, 'x', 42, {}])('returns an empty list for the non-array %j', (value) => {
      expect(sanitizeEntries(value)).toEqual([]);
    });
  });
});
