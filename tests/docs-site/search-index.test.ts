import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import { buildSearchIndex } from '../../projects/site/tools/generate-search-index';

const schema = JSON.parse(
  readFileSync(join(__dirname, '../../projects/site/src/content/search-index.schema.json'), 'utf8'),
);
const validate = new Ajv2020({ strict: false }).compile(schema);

const validIndex = {
  version: 1,
  entries: [{ title: 'Button', section: 'components', group: 'Buttons / actions', url: '/docs/components/button' }],
};

describe('search index', () => {
  describe('buildSearchIndex output', () => {
    // SITE-012 (supporting): the generated file satisfies the contract
    it('validates against the search-index schema', () => {
      const index = buildSearchIndex();
      const ok = validate(index);
      expect(validate.errors ?? []).toEqual([]);
      expect(ok).toBe(true);
    });

    it('declares version 1 and a non-empty entry list', () => {
      const index = buildSearchIndex();
      expect(index.version).toBe(1);
      expect(index.entries.length).toBeGreaterThan(0);
    });

    it('includes the DataTable component page', () => {
      const urls = buildSearchIndex().entries.map((e) => e.url);
      expect(urls).toContain('/docs/components/data-table');
    });

    it('only contains same-site absolute paths (M-01, M-02)', () => {
      for (const entry of buildSearchIndex().entries) {
        expect(entry.url).toMatch(/^\/(?!\/)[A-Za-z0-9/_-]*$/);
      }
    });

    it('exposes only title, section, group and url per entry (M-02)', () => {
      for (const entry of buildSearchIndex().entries) {
        expect(Object.keys(entry).sort()).toEqual(['group', 'section', 'title', 'url']);
      }
    });
  });

  describe('schema contract', () => {
    it('accepts a well-formed index', () => {
      expect(validate(validIndex)).toBe(true);
    });

    it.each(['//evil.example', '/\\evil.example', 'https://evil.example', 'javascript:alert(1)'])(
      'rejects the url %j (M-01, M-02)',
      (url) => {
        const index = { version: 1, entries: [{ ...validIndex.entries[0], url }] };
        expect(validate(index)).toBe(false);
      },
    );

    it('rejects an unknown version', () => {
      expect(validate({ ...validIndex, version: 2 })).toBe(false);
    });

    it('rejects extra properties on entries', () => {
      const index = { version: 1, entries: [{ ...validIndex.entries[0], extra: 'x' }] };
      expect(validate(index)).toBe(false);
    });
  });
});
