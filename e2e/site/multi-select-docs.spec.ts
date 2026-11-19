import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/multi-select';
const DEMOS_DIR = 'projects/site/src/app/pages/docs/components/demos';

/** One demo per capability; each demo component uses the selector `app-multi-select-<name>-demo` and the anchor id `example-<name>`. */
const DEMOS = [
  'basic',
  'grouped',
  'chips',
  'template-value',
  'template-option',
  'template-group',
  'template-chip',
  'template-header-footer',
  'template-empty',
  'template-icons',
  'filter',
  'loading',
  'selection-limit',
  'select-all',
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

const COMPONENT_SOURCE = 'projects/medra/ui/src/lib/multi-select/multi-select.component.ts';

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

/** Aliases the API generator prints as the type they resolve to, so the table shows the underlying name. */
const RESOLVED_ALIASES: Record<string, string> = { SelectSize: 'InputTextSize' };

test.describe('MultiSelect docs page', () => {
  // SITE-025.S1
  for (const demo of DEMOS) {
    test(`SITE-025.S1: the page shows the "${demo}" example and lists it in "On this page"`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(PAGE);
      await expect(page.locator(`app-multi-select-${demo}-demo`), `no "${demo}" example on the page`).toHaveCount(1, { timeout: 5_000 });
      await expect(page.locator(`#example-${demo}`), `no anchor "example-${demo}"`).toHaveCount(1);
      await expect(
        page.getByRole('navigation', { name: 'On this page' }).locator(`a[href$="#example-${demo}"]`),
        `no "On this page" item for "${demo}"`,
      ).toHaveCount(1);
    });
  }

  // SITE-025.S2
  test('SITE-025.S2: the basic example picks two options, shows their labels and opens the panel next to the trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PAGE);
    const example = page.locator('#example-basic');
    await expect(example).toHaveCount(1, { timeout: 5_000 });
    const field = example.locator('med-multi-select [role="combobox"]').first();
    await field.scrollIntoViewIfNeeded();
    await field.click();

    // L-015: jsdom has no layout, so the panel box is measured against the trigger in the browser.
    const panel = page.locator('.cdk-overlay-pane').first();
    await expect(panel).toBeVisible({ timeout: 5_000 });
    const triggerBox = await field.boundingBox();
    const panelBox = await panel.boundingBox();
    expect(triggerBox, 'the trigger has no bounding box').not.toBeNull();
    expect(panelBox, 'the panel has no bounding box').not.toBeNull();
    const gap = Math.min(Math.abs(panelBox!.y - (triggerBox!.y + triggerBox!.height)), Math.abs(triggerBox!.y - (panelBox!.y + panelBox!.height)));
    expect(gap, 'the panel is not next to the trigger vertically').toBeLessThanOrEqual(16);
    expect(Math.abs(panelBox!.x - triggerBox!.x), 'the panel is not aligned with the trigger horizontally').toBeLessThanOrEqual(16);

    const options = page.locator('.cdk-overlay-pane [role="option"]');
    const labels: string[] = [];
    for (let index = 0; index < 2; index++) {
      const option = options.nth(index);
      const label = ((await option.innerText()) ?? '').trim();
      expect(label.length, `option ${index} has no label`).toBeGreaterThan(0);
      labels.push(label);
      await option.click();
    }
    for (const label of labels) {
      await expect(field, `the field does not show "${label}"`).toContainText(label, { timeout: 5_000 });
    }
  });

  // SITE-025.S4
  test('SITE-025.S4: the data-model example explains `label`/`value`, `group`, the nested group inputs and the field mapping', async ({ page }) => {
    await page.goto(PAGE);
    const section = page.locator('#example-data-model');
    await expect(section).toHaveCount(1, { timeout: 5_000 });
    const text = (await section.innerText()).replace(/\s+/g, ' ');

    for (const term of ['label', 'value', 'group', 'optionGroupLabel', 'optionGroupChildren', 'optionLabel', 'optionValue', 'optionDisabled']) {
      expect(new RegExp(`\\b${term}\\b`).test(text), `the text does not mention ${term}`).toBe(true);
    }

    const source = readFileSync(`${DEMOS_DIR}/multi-select-data-model.demo.ts`, 'utf8') + readFileSync(`${DEMOS_DIR}/multi-select-data-model.demo.html`, 'utf8');
    expect(/optionLabel=|\[optionLabel\]=/.test(source), 'the example does not map fields with its own names').toBe(true);
    expect(/group\s*:|optionGroupChildren/.test(source), 'the example data has no groups').toBe(true);
  });

  // SITE-025.S5 (L-016: compares the type of each entry, not only the default)
  test('SITE-025.S5: the API table lists every input, output and template with the declared type and default', async ({ page }) => {
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
          const declared = normalizeType(RESOLVED_ALIASES[member.declaredType] ?? member.declaredType);
          expect(sortUnion(row!.type), `type of input "${member.name}"`).toBe(sortUnion(declared));
        }
      } else {
        expect(normalizeType(row!.type), `type of output "${member.name}"`).toBe(normalizeType(member.detail ?? 'void'));
      }
    }
  });
});
