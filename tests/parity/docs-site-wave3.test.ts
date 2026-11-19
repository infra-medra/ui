import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '../..');
const API_DIR = path.join(REPO_ROOT, 'projects/site/src/content/api');

interface ApiEntry {
  name: string;
  kind: string;
  type?: string;
  signature?: string;
  default?: string | null;
  description: string | null;
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
    expect(typeof entry.type === 'string' || typeof entry.signature === 'string').toBe(true);
    expect(entry.default === undefined || entry.default === null || typeof entry.default === 'string').toBe(true);
    expect(entry.description === null || typeof entry.description === 'string').toBe(true);
  }
  return entries;
}

// @scenario SITE-005.S1
describe('Docs Site Wave 3 Coverage (SITE-005.S1)', () => {
  it('documents all 23 Wave 3 Feedback, Overlay, Forms & Fluid API additions', () => {
    // Members listed here are limited to API that exists in @medra/ui and that the generator can
    // extract. Dropped because the library has no such member (docs must match code, L-003):
    // dialog `modal`/`show`/`hide`, confirm-dialog `breakpoints`/`close`, confirm-popup
    // `#message`/`close`, message-toast `preventOpenDuplicates`.
    const expectedMembers: Record<string, string[]> = {
      dialog: [
        'visible',
        'visibleChange',
        'header',
        'closable',
        'closeOnEscape',
        'dismissableMask',
        'draggable',
        'resizable',
        'maximizable',
        'position',
        'breakpoints',
        '#header',
        '#footer',
        'open',
      ],
      'confirm-dialog': [
        'key',
        'position',
        'draggable',
        'closable',
        'defaultFocus',
        '#message',
        '#headless',
        'confirm',
      ],
      'confirm-popup': ['key', 'defaultFocus', '#headless', 'confirm'],
      drawer: ['shown', 'hidden'],
      popover: ['shown', 'hidden', 'show', 'hide', 'toggle'],
      tooltip: ['tooltipEvent', 'medTooltip'],
      'message-toast': ['key', 'position', 'preventDuplicates', 'sticky', 'add', 'clear'],
      'progress-spinner': ['strokeWidth'],
      'input-text': ['variant', 'fluid'],
      textarea: ['variant', 'fluid'],
      'input-number': ['variant', 'fluid'],
      'input-otp': ['variant', 'fluid', '#input'],
      checkbox: ['variant', 'binary'],
      'radio-button': ['variant'],
      'toggle-switch': ['trueValue', 'falseValue', 'readonly'],
      slider: ['orientation'],
      rating: ['#onicon', '#officon', '#cancelicon'],
      'multi-select': ['maxSelectedLabels', 'selectedItemsLabel', 'virtualScroll'],
      listbox: ['checkmark', 'striped'],
      'input-chips': ['separator'],
      'file-upload': ['mode', 'customUpload', 'uploadHandler'],
      knob: ['valueTemplate'],
      fluid: ['medFluid', 'fluid', 'MED_FLUID_CONTEXT'],
    };

    expect(Object.keys(expectedMembers)).toHaveLength(23);

    for (const [component, requiredNames] of Object.entries(expectedMembers)) {
      const entries = readApi(component);
      const names = new Set(entries.map((e) => e.name));
      for (const member of requiredNames) {
        expect(names.has(member)).toBe(true);
      }
    }
  });

  it('documents M-01 client-only UX note and M-02 customUpload note on file-upload.json', () => {
    const entries = readApi('file-upload');
    const combinedDescriptions = entries
      .map((entry) => entry.description ?? '')
      .join(' ')
      .toLowerCase();

    expect(combinedDescriptions).toContain('client-side');
    expect(combinedDescriptions).toContain('server');
    expect(combinedDescriptions).toContain('uploadhandler');
  });

  it('documents M-04 key/defaultFocus security guidance on confirm-dialog.json and confirm-popup.json', () => {
    for (const file of ['confirm-dialog', 'confirm-popup']) {
      const entries = readApi(file);
      const keyEntry = entries.find((e) => e.name === 'key');
      const focusEntry = entries.find((e) => e.name === 'defaultFocus');

      expect(typeof keyEntry?.description).toBe('string');
      expect((keyEntry?.description ?? '').length).toBeGreaterThan(10);
      expect(typeof focusEntry?.description).toBe('string');
      expect((focusEntry?.description ?? '').toLowerCase()).toContain('reject');
    }
  });
});
