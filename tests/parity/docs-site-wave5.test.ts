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
const PUBLIC_API_PATH = path.resolve(__dirname, '../../projects/medra/ui/src/public-api.ts');

const WAVE5_EXPECTED_MEMBERS: Record<string, string[]> = {
  'chart.json': [
    'type',
    'data',
    'options',
    'plugins',
    'width',
    'height',
    'responsive',
    'ariaLabel',
    'styleClass',
    'onDataSelect',
    'refresh',
    'reinit',
    'getBase64Image',
  ],
  'style-class.json': [
    'medStyleClass',
    'enterFromClass',
    'enterActiveClass',
    'enterToClass',
    'leaveFromClass',
    'leaveActiveClass',
    'leaveToClass',
    'hideOnOutsideClick',
    'hideOnEscape',
    'toggleClass',
    'trigger',
  ],
  'class-names.json': ['medClassNames'],
  'bind.json': ['medBind'],
};

const WAVE5_FILES = Object.keys(WAVE5_EXPECTED_MEMBERS);

describe('Docs Site API Content — Wave 5 (SITE-007.S1, SITE-007.S2)', () => {
  it.each(WAVE5_FILES)('publishes valid API reference entries for %s matching @medra/ui members', (fileName) => {
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

    const documentedNames = parsed.map((entry) => entry.name);
    for (const expectedMember of WAVE5_EXPECTED_MEMBERS[fileName]) {
      expect(documentedNames).toContain(expectedMember);
    }
  });

  it('exports all Wave 5 symbols in @medra/ui public-api.ts (SITE-007.S2)', () => {
    const publicApi = fs.readFileSync(PUBLIC_API_PATH, 'utf8');
    expect(publicApi).toContain('./lib/chart/chart.component');
    expect(publicApi).toContain('./lib/style-class/style-class.directive');
    expect(publicApi).toContain('./lib/class-names/class-names.directive');
    expect(publicApi).toContain('./lib/bind/bind.directive');
  });

  it('re-exports ChartComponent, StyleClassDirective, ClassNamesDirective, BindDirective and public types (UI-013.S5)', () => {
    const publicApi = fs.readFileSync(PUBLIC_API_PATH, 'utf8');
    const uiSrcDir = path.dirname(PUBLIC_API_PATH);
    const expectedModules: Array<{ specifier: string; file: string; symbols: string[] }> = [
      {
        specifier: "export * from './lib/chart/chart.component';",
        file: path.join(uiSrcDir, 'lib/chart/chart.component.ts'),
        symbols: ['export class ChartComponent', 'export type ChartType', 'export interface ChartDataSelectEvent'],
      },
      {
        specifier: "export * from './lib/style-class/style-class.directive';",
        file: path.join(uiSrcDir, 'lib/style-class/style-class.directive.ts'),
        symbols: ['export class StyleClassDirective'],
      },
      {
        specifier: "export * from './lib/class-names/class-names.directive';",
        file: path.join(uiSrcDir, 'lib/class-names/class-names.directive.ts'),
        symbols: ['export class ClassNamesDirective', 'export type ClassNamesValue'],
      },
      {
        specifier: "export * from './lib/bind/bind.directive';",
        file: path.join(uiSrcDir, 'lib/bind/bind.directive.ts'),
        symbols: ['export class BindDirective', 'export type BindMap'],
      },
    ];

    for (const mod of expectedModules) {
      expect(publicApi).toContain(mod.specifier);
      const source = fs.readFileSync(mod.file, 'utf8');
      for (const symbol of mod.symbols) {
        expect(source).toContain(symbol);
      }
    }
  });
});
