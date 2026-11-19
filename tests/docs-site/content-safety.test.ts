import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DOCS = join(__dirname, '../../projects/site/src/content/docs');

const FOUNDATIONS = [
  'brand-identity',
  'design-tokens',
  'theming',
  'accessibility',
  'i18n',
  'overlays',
  'forms',
].map((slug) => `foundations-${slug}.txt`);

const files = readdirSync(DOCS).filter((name) => name.endsWith('.txt'));

describe('docs content safety (M-07)', () => {
  // SITE-015.S1: the sidebar lists seven foundations pages, so seven content files must exist.
  describe('SITE-015.S1 foundations content files', () => {
    it.each(FOUNDATIONS)('%s exists', (file) => {
      expect(existsSync(join(DOCS, file))).toBe(true);
    });
  });

  // SITE-015.S2: the design tokens page lists the brand and surface tokens by name.
  describe('SITE-015.S2 design tokens page', () => {
    const file = join(DOCS, 'foundations-design-tokens.txt');
    const text = () => (existsSync(file) ? readFileSync(file, 'utf8') : '');

    it('lists the brand tokens', () => {
      expect(text()).toMatch(/brand/);
    });

    it('lists the surface tokens', () => {
      expect(text()).toMatch(/surface/);
    });
  });

  describe.each(files)('%s', (file) => {
    // Fenced blocks and inline code spans are HTML-escaped by the markdown renderer, so a
    // mention such as `<script>` in prose is text. Only raw HTML outside them can execute.
    const text = () =>
      readFileSync(join(DOCS, file), 'utf8')
        .replace(/^(```|~~~)[\s\S]*?^\1/gm, '')
        .replace(/`[^`\n]*`/g, '');

    it('has no <script tag', () => {
      expect(text()).not.toMatch(/<script/i);
    });

    it('has no <iframe tag', () => {
      expect(text()).not.toMatch(/<iframe/i);
    });

    it('has no on* event handler attributes', () => {
      expect(text()).not.toMatch(/<[^>]*\son[a-z]+\s*=/i);
    });

    it('has no javascript: URLs', () => {
      expect(text()).not.toMatch(/javascript:/i);
    });
  });
});
