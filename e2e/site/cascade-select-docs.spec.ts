import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/cascade-select';
const COMPONENT_SOURCE = 'projects/medra/ui/src/lib/cascade-select/cascade-select.component.ts';
const DEMOS_DIR = 'projects/site/src/app/pages/docs/components/demos';

/** One demo per capability; each demo component uses the selector `app-cascade-select-<name>-demo` and the anchor id `example-<name>`. */
const DEMOS = [
  'basic',
  'template-value',
  'template-option',
  'template-header-footer',
  'template-icons',
  'loading',
  'float-label',
  'ifta-label',
  'clear-icon',
  'sizes',
  'fluid',
  'filled',
  'disabled',
  'invalid',
  'data-model',
  'events',
  'signal-forms',
  'template-driven',
  'reactive-forms',
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

test.describe('CascadeSelect docs page', () => {
  // SITE-023.S1
  for (const demo of DEMOS) {
    test(`SITE-023.S1: the page shows the "${demo}" example and lists it in "On this page"`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(PAGE);
      await expect(page.locator(`app-cascade-select-${demo}-demo`), `no "${demo}" example on the page`).toHaveCount(1, { timeout: 5_000 });
      await expect(page.locator(`#example-${demo}`), `no anchor "example-${demo}"`).toHaveCount(1);
      await expect(
        page.getByRole('navigation', { name: 'On this page' }).locator(`a[href$="#example-${demo}"]`),
        `no "On this page" item for "${demo}"`,
      ).toHaveCount(1);
    });
  }

  // SITE-023.S2
  test('SITE-023.S2: the basic example opens the panel and shows the path of the picked leaf', async ({ page }) => {
    await page.goto(PAGE);
    const example = page.locator('#example-basic');
    await expect(example).toHaveCount(1, { timeout: 5_000 });
    const field = example.locator('med-cascade-select [role="combobox"]').first();
    await field.scrollIntoViewIfNeeded();
    await field.click();
    // Walk down the first branch of each level until a leaf closes the panel.
    for (let level = 0; level < 6 && (await page.locator('.cdk-overlay-pane').count()) > 0; level++) {
      const rows = page.locator('.cdk-overlay-pane').last().locator('[role="option"]');
      await rows.first().click();
    }
    await expect(field).toContainText('/', { timeout: 5_000 });
  });

  // SITE-023.S4
  test('SITE-023.S4: the data-model example explains `children`, leaf-only `value` and the field mapping', async ({ page }) => {
    await page.goto(PAGE);
    const section = page.locator('#example-data-model');
    await expect(section).toHaveCount(1, { timeout: 5_000 });
    const text = (await section.innerText()).replace(/\s+/g, ' ');

    expect(/\bchildren\b/.test(text), 'the text does not mention `children`').toBe(true);
    expect(/\bvalue\b/.test(text) && /\bleaf|leaves\b/i.test(text), 'the text does not say only leaves have a `value`').toBe(true);
    for (const input of ['optionLabel', 'optionValue', 'optionGroupChildren']) {
      expect(text.includes(input), `the text does not mention ${input}`).toBe(true);
    }

    const source = readFileSync(`${DEMOS_DIR}/cascade-select-data-model.demo.ts`, 'utf8') + readFileSync(`${DEMOS_DIR}/cascade-select-data-model.demo.html`, 'utf8');
    expect((source.match(/(children|items|nodes)\s*:/g) ?? []).length > 1, 'the example data has fewer than two levels').toBe(true);
    expect(/optionLabel=|\[optionLabel\]=/.test(source), 'the example does not map fields with its own names').toBe(true);
  });

  // SITE-023.S5
  test('SITE-023.S5: the API table lists every input, output and template with the declared type and default', async ({ page }) => {
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
      } else {
        expect(normalizeType(row!.type), `type of output "${member.name}"`).toBe(normalizeType(member.detail ?? 'void'));
      }
    }
  });
});
