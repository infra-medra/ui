import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = join(__dirname, '../../projects/site');
const FILES = [
  'src/app/search/search-match.ts',
  'src/app/search/search-loader.ts',
  'src/app/shell/search-dialog.ts',
];

/** Strips comments so the rules below only look at executable code and templates. */
function code(file: string): string {
  const text = readFileSync(join(SITE, file), 'utf8');
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

describe('search safety (M-04, M-05)', () => {
  it.each(FILES)('%s exists', (file) => {
    expect(existsSync(join(SITE, file))).toBe(true);
  });

  describe.each(FILES)('%s', (file) => {
    const source = () => code(file);

    it('does not use innerHTML or outerHTML (M-04)', () => {
      expect(source()).not.toMatch(/\b(innerHTML|outerHTML)\b/);
    });

    it('does not use bypassSecurityTrust* (M-04)', () => {
      expect(source()).not.toMatch(/bypassSecurityTrust/);
    });

    it('does not highlight matches through HTML (M-04)', () => {
      expect(source()).not.toMatch(/<mark\b|<b>|<strong>|insertAdjacentHTML|DOMParser/);
    });

    it('does not call external domains (M-05)', () => {
      expect(source()).not.toMatch(/https?:\/\//);
    });

    it('does not send beacons or load third-party scripts (M-05)', () => {
      expect(source()).not.toMatch(/sendBeacon|createElement\(\s*['"]script['"]|XMLHttpRequest|WebSocket|gtag|analytics/i);
    });

    it('does not put the query into the URL or storage (M-05)', () => {
      expect(source()).not.toMatch(/localStorage|sessionStorage|document\.cookie|queryParams|history\.(push|replace)State|window\.location|location\.(href|search|hash)/);
    });
  });

  it('search-dialog navigates only through the Router (M-02)', () => {
    const source = code('src/app/shell/search-dialog.ts');
    expect(source).toMatch(/navigateByUrl/);
    expect(source).not.toMatch(/window\.location|location\.assign|location\.replace|\[href\]|\[attr\.href\]/);
  });
});
