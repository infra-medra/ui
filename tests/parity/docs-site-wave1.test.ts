import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '../..');
const API_DIR = path.join(REPO_ROOT, 'projects/site/src/content/api');
const DOCS_DIR = path.join(REPO_ROOT, 'projects/site/src/content/docs');

interface ApiEntry {
  name: string;
  kind: string;
  type: string;
  default: string;
  description: string;
}

function readApi(name: string): ApiEntry[] {
  const filePath = path.join(API_DIR, `${name}.json`);
  expect(fs.existsSync(filePath)).toBe(true);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
  expect(Array.isArray(parsed)).toBe(true);
  const entries = parsed as ApiEntry[];
  expect(entries.length).toBeGreaterThan(0);
  for (const entry of entries) {
    expect(typeof entry.name).toBe('string');
    expect(typeof entry.kind).toBe('string');
    expect(typeof entry.type).toBe('string');
    expect(entry.default === null || typeof entry.default === 'string').toBe(true);
    expect(entry.description === null || typeof entry.description === 'string').toBe(true);
  }
  return entries;
}

describe('Docs Site Wave 1 Coverage (SITE-003.S1)', () => {
  it.each(['icon', 'overlay', 'ripple', 'terminal'])(
    'provides valid API JSON and intro doc for %s',
    (slug) => {
      readApi(slug);
      const docPath = path.join(DOCS_DIR, `${slug}-intro.txt`);
      expect(fs.existsSync(docPath)).toBe(true);
      const docContent = fs.readFileSync(docPath, 'utf8').trim();
      expect(docContent.length).toBeGreaterThan(40);
    },
  );

  it('documents all Wave 1 Buttons & Actions API additions', () => {
    const expectedMembers: Record<string, string[]> = {
      button: ['badge', 'badgeSeverity', 'fluid'],
      'split-button': ['rounded', 'dropdownIcon', 'dropdownClick', '#content'],
      'speed-dial': ['type', 'radius', 'showIcon', 'hideIcon', 'visible'],
      'toggle-button': ['iconPos', 'readonly', 'allowEmpty'],
      'select-button': ['options', 'optionLabel', 'optionValue', 'optionDisabled'],
    };

    for (const [component, requiredNames] of Object.entries(expectedMembers)) {
      const entries = readApi(component);
      const names = new Set(entries.map((e) => e.name));
      for (const member of requiredNames) {
        expect(names.has(member)).toBe(true);
      }
    }
  });
});
