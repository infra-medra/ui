import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/autocomplete';
const COMPONENT_SOURCE = 'projects/medra/ui/src/lib/autocomplete/autocomplete.component.ts';

/** One demo per capability; each demo component uses the selector `app-autocomplete-<name>-demo`. */
const DEMOS = [
  'basic',
  'multiple',
  'grouped-dropdown',
  'force-selection',
  'complete-on-focus',
  'events',
  'auto-highlight',
  'unique',
  'readonly',
  'scroll-height',
  'item-template',
  'group-template',
  'empty-template',
  'loader-template',
  'virtual-scroll',
  'states',
  'sizes',
];

interface DeclaredMember {
  name: string;
  kind: 'input' | 'output';
  /** Default literal of an input (`undefined` for a required input) or the event type of an output. */
  detail: string | undefined;
}

/** Reads the public `readonly x = input(...)` / `output<T>()` members of the component class. */
function declaredMembers(): DeclaredMember[] {
  const source = readFileSync(COMPONENT_SOURCE, 'utf8');
  const members: DeclaredMember[] = [];
  const pattern = /^ {2}readonly (\w+)\s*=\s*(input|output)(\.required)?(<)?/gm;
  for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
    const [whole, name, kind, required, generic] = match;
    let cursor = match.index + whole.length;
    let eventType: string | undefined;
    if (generic) {
      let depth = 1;
      const start = cursor;
      while (depth > 0) {
        const char = source[cursor++];
        depth += char === '<' ? 1 : char === '>' && source[cursor - 2] !== '=' ? -1 : 0;
      }
      eventType = source.slice(start, cursor - 1).trim();
    }
    while (source[cursor] !== '(') cursor++;
    cursor++;
    let depth = 0;
    const argStart = cursor;
    while (!(depth === 0 && (source[cursor] === ',' || source[cursor] === ')'))) {
      if ('([{'.includes(source[cursor])) depth++;
      if (')]}'.includes(source[cursor])) depth--;
      cursor++;
    }
    const firstArg = source.slice(argStart, cursor).trim();
    members.push({
      name,
      kind: kind as 'input' | 'output',
      detail: kind === 'output' ? eventType : required ? undefined : firstArg,
    });
  }
  return members;
}

/** The API generator prints object types with a trailing `;` before the closing brace; compare without it. */
const normalizeType = (type: string): string => type.replace(/;\s*}/g, ' }').replace(/\s+/g, ' ').trim();

test.describe('AutoComplete docs page', () => {
  // SITE-020.S1
  for (const demo of DEMOS) {
    test(`SITE-020.S1: the page shows the "${demo}" example`, async ({ page }) => {
      await page.goto(PAGE);
      await expect(page.locator(`app-autocomplete-${demo}-demo`), `no "${demo}" example on the page`).toHaveCount(1, { timeout: 5_000 });
    });
  }

  // SITE-020.S2
  test('SITE-020.S2: the forceSelection example empties the field when free text is left behind', async ({ page }) => {
    await page.goto(PAGE);
    const input = page.locator('app-autocomplete-force-selection-demo med-autocomplete input').first();
    await input.scrollIntoViewIfNeeded({ timeout: 5_000 });
    await input.click();
    await page.keyboard.type('not a suggestion');
    await page.keyboard.press('Tab');
    await expect(input).toHaveValue('');
  });

  // SITE-020.S3
  test('SITE-020.S3: the API table lists every input and output with the declared type and default', async ({ page }) => {
    await page.goto(PAGE);
    const rows = await page.locator('app-api-table tbody tr').evaluateAll((trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td.textContent ?? '').replace(/\s+/g, ' ').trim())),
    );
    const byName = new Map(rows.map(([name, type, def]) => [name, { type, def }]));

    // Every `contentChild('name')` of the component is a template and has a row in the table.
    const templates = [...readFileSync(COMPONENT_SOURCE, 'utf8').matchAll(/^ {2}readonly \w+\s*=\s*contentChild<[^\n]*>\('(\w+)'\)/gm)].map((match) => match[1]);
    expect(templates.length, 'the component declares no templates').toBeGreaterThan(0);
    for (const name of templates) {
      expect(byName.get(`#${name}`), `the API table has no row for template "#${name}"`).toBeDefined();
    }

    for (const member of declaredMembers()) {
      const row = byName.get(member.name);
      expect(row, `the API table has no row for ${member.kind} "${member.name}"`).toBeDefined();
      if (member.kind === 'input') {
        expect(row!.def, `default of input "${member.name}"`).toBe(member.detail ?? '—');
      } else {
        expect(normalizeType(row!.type), `type of output "${member.name}"`).toBe(normalizeType(member.detail ?? 'void'));
      }
    }
  });
});
