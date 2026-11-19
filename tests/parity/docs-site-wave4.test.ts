import * as fs from 'node:fs';
import * as path from 'node:path';

interface ApiDocEntry {
  name: string;
  kind: 'input' | 'output' | 'method';
  type?: string;
  signature?: string;
  default?: string;
  description: string;
}

const API_DIR = path.resolve(__dirname, '../../projects/site/src/content/api');
const WAVE4_FILES = [
  'scroll-top.json',
  'auto-focus.json',
  'focus-trap.json',
  'key-filter.json',
  'animate-on-scroll.json',
  'defer.json',
];

describe('Docs Site API Content — Wave 4 (SITE-006.S1)', () => {
  it.each(WAVE4_FILES)('publishes valid API reference entries for %s', (fileName) => {
    const filePath = path.join(API_DIR, fileName);
    expect(fs.existsSync(filePath)).toBe(true);

    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as ApiDocEntry[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);

    for (const entry of parsed) {
      expect(typeof entry.name).toBe('string');
      expect(entry.name.trim().length).toBeGreaterThan(0);
      expect(['input', 'output', 'method']).toContain(entry.kind);
      expect(typeof entry.description).toBe('string');
      expect(entry.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('documents that KeyFilter is a client-side UX control and not a replacement for server-side validation (M-03)', () => {
    const filePath = path.join(API_DIR, 'key-filter.json');
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content.toLowerCase()).toContain('ux');
    expect(content.toLowerCase()).toContain('server-side');
  });
});
