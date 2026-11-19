import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '../..');
const API_FILE = path.join(REPO_ROOT, 'projects/site/src/content/api/icon.json');
const INTRO_DOC_FILE = path.join(REPO_ROOT, 'projects/site/src/content/docs/icon-intro.txt');
const DESIGN_SYSTEM_FILE = path.join(REPO_ROOT, 'design-system/02-components/layout/icon.md');

interface ApiEntry {
  name: string;
  kind: string;
  type: string;
  default: string;
  description: string;
}

describe('CDN Icon Documentation & API Reference (SITE-008.S1)', () => {
  it('documents all IconComponent inputs in icon.json including fontIcon and ariaLabel [SITE-008.S1]', () => {
    expect(fs.existsSync(API_FILE)).toBe(true);
    const entries = JSON.parse(fs.readFileSync(API_FILE, 'utf8')) as ApiEntry[];
    const entryMap = new Map(entries.map((e) => [e.name, e]));

    const expectedInputs = ['name', 'variant', 'class', 'icon', 'fontIcon', 'ariaLabel'];
    for (const inputName of expectedInputs) {
      expect(entryMap.has(inputName)).toBe(true);
    }

    const fontIconEntry = entryMap.get('fontIcon')!;
    expect(fontIconEntry.kind).toBe('input');
    expect(fontIconEntry.type).toContain('string');

    const ariaLabelEntry = entryMap.get('ariaLabel')!;
    expect(ariaLabelEntry.kind).toBe('input');
    expect(ariaLabelEntry.type).toContain('string');

    const iconEntry = entryMap.get('icon')!;
    expect(iconEntry.kind).toBe('input');
  });

  it('includes CDN integration instructions and examples in docs and design system [SITE-008.S1]', () => {
    expect(fs.existsSync(INTRO_DOC_FILE)).toBe(true);
    const introContent = fs.readFileSync(INTRO_DOC_FILE, 'utf8');

    // Must mention CDN, stylesheet link or @import, and font classes
    expect(introContent.toLowerCase()).toContain('cdn');
    expect(introContent).toMatch(/(<link|@import)/);
    expect(introContent).toContain('fa-solid');

    expect(fs.existsSync(DESIGN_SYSTEM_FILE)).toBe(true);
    const designContent = fs.readFileSync(DESIGN_SYSTEM_FILE, 'utf8');
    expect(designContent.toLowerCase()).toContain('cdn');
    expect(designContent).toMatch(/(<link|@import)/);
    expect(designContent).toContain('fa-solid');
  });
});
