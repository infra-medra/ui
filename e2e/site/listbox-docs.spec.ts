import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/listbox';
const DEMOS_DIR = 'projects/site/src/app/pages/docs/components/demos';

/** One demo per capability; each demo component uses the selector `app-listbox-<name>-demo` and the anchor id `example-<name>`. */
const DEMOS = [
  'basic',
  'multiple',
  'meta-key-selection',
  'grouped',
  'filter',
  'template-option',
  'template-group',
  'template-header-footer',
  'template-empty',
  'loading',
  'select-all',
  'dragdrop',
  'checkmark',
  'striped',
  'disabled',
  'invalid',
  'readonly',
  'data-model',
  'events',
  'signal-forms',
  'template-driven',
  'reactive-forms',
];

const COMPONENT_SOURCE = 'projects/medra/ui/src/lib/listbox/listbox.component.ts';

interface DeclaredMember {
  name: string;
  kind: 'input' | 'output';
  /** Default literal of an input (`undefined` for a required input) or the event type of an output. */
  detail: string | undefined;
  /** Explicit generic type of the member (`input<Type>(...)` / `output<Type>()`); `undefined` when the type is inferred. */
  declaredType?: string;
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
      declaredType: eventType,
    });
  }
  return members;
}

/** The API generator prints object types with a trailing `;` before the closing brace; compare without it. */
const normalizeType = (type: string): string =>
  type
    .replace(/import\("[^"]*"\)\./g, '')
    .replace(/"/g, "'")
    .replace(/;\s*}/g, ' }')
    .replace(/\s+/g, ' ')
    .trim();

/** The generator may reorder union members; compare them as a sorted set. */
const sortUnion = (type: string): string =>
  normalizeType(type)
    .split(' | ')
    .sort()
    .join(' | ');

test.describe('Listbox docs page', () => {
  // SITE-026.S1
  for (const demo of DEMOS) {
    test(`SITE-026.S1: the page shows the "${demo}" example and lists it in "On this page"`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(PAGE);
      await expect(page.locator(`app-listbox-${demo}-demo`), `no "${demo}" example on the page`).toHaveCount(1, { timeout: 5_000 });
      await expect(page.locator(`#example-${demo}`), `no anchor "example-${demo}"`).toHaveCount(1);
      await expect(
        page.getByRole('navigation', { name: 'On this page' }).locator(`a[href$="#example-${demo}"]`),
        `no "On this page" item for "${demo}"`,
      ).toHaveCount(1);
    });
  }

  // SITE-026.S2
  test('SITE-026.S2: choosing an option of the basic example marks it as selected', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PAGE);
    const example = page.locator('#example-basic');
    await expect(example, 'no "basic" example on the page').toHaveCount(1, { timeout: 5_000 });
    const option = example.locator('med-listbox [role="option"]').first();
    await option.scrollIntoViewIfNeeded();
    await expect(option, 'the first option starts selected').not.toHaveAttribute('aria-selected', 'true');
    await option.click();
    await expect(option, 'the chosen option is not marked as selected').toHaveAttribute('aria-selected', 'true', { timeout: 5_000 });
  });

  // SITE-026.S4
  test('SITE-026.S4: the data-model example explains `label`/`value`, `group`, the nested group inputs and the field mapping', async ({ page }) => {
    await page.goto(PAGE);
    const section = page.locator('#example-data-model');
    await expect(section, 'no "data-model" example on the page').toHaveCount(1, { timeout: 5_000 });
    const text = (await section.innerText()).replace(/\s+/g, ' ');

    for (const term of ['label', 'value', 'group', 'optionGroupLabel', 'optionGroupChildren', 'optionLabel', 'optionValue', 'optionDisabled']) {
      expect(new RegExp(`\\b${term}\\b`).test(text), `the text does not mention ${term}`).toBe(true);
    }

    const source = readFileSync(`${DEMOS_DIR}/listbox-data-model.demo.ts`, 'utf8') + readFileSync(`${DEMOS_DIR}/listbox-data-model.demo.html`, 'utf8');
    expect(/optionLabel=|\[optionLabel\]=/.test(source), 'the example does not map fields with its own names').toBe(true);
    expect(/group\s*:|optionGroupChildren/.test(source), 'the example data has no groups').toBe(true);
  });

  // SITE-026.S4
  test('SITE-026.S4: the dragdrop example says that groups, filter and templates do not apply to it', async ({ page }) => {
    await page.goto(PAGE);
    const section = page.locator('#example-dragdrop');
    await expect(section, 'no "dragdrop" example on the page').toHaveCount(1, { timeout: 5_000 });
    const text = (await section.innerText()).replace(/\s+/g, ' ');

    expect(/dragdrop/i.test(text), 'the text does not mention dragdrop').toBe(true);
    for (const term of ['groups', 'filter', 'templates']) {
      expect(new RegExp(`\\b${term}\\b`, 'i').test(text), `the text does not say that ${term} do not apply`).toBe(true);
    }
    expect(/do(es)? not apply|not supported|ignored/i.test(text), 'the text does not state the limit of the mode').toBe(true);
  });

  // SITE-026.S5 (L-016: compares the type of each entry, not only the default)
  test('SITE-026.S5: the API table lists every input, output and template with the declared type and default', async ({ page }) => {
    await page.goto(PAGE);
    const rows = await page.locator('app-api-table tbody tr').evaluateAll((trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td.textContent ?? '').replace(/\s+/g, ' ').trim())),
    );
    const byName = new Map(rows.map(([name, type, def]) => [name, { type, def }]));

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
        if (member.declaredType) {
          expect(sortUnion(row!.type), `type of input "${member.name}"`).toBe(sortUnion(member.declaredType));
        }
      } else {
        expect(normalizeType(row!.type), `type of output "${member.name}"`).toBe(normalizeType(member.detail ?? 'void'));
      }
    }
  });
});
