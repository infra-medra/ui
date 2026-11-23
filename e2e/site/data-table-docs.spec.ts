import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';

/** The features the page documented before DAT-024, by slug of the example that now shows each one. */
const PRE_EXISTING = ['basic', 'sort-multiple', 'edit-cell', 'export-csv', 'lazy', 'row-group-subheader', 'row-reorder-events'];

/** The examples DAT-024.S4 adds, by slug. */
const NEW_APPEARANCE_AND_SELECTION = ['selection-radio', 'keyboard-navigation', 'size', 'grid-lines', 'striped-rows'];

/** The examples DAT-024.S5 adds for row labels and row identity, by slug. */
const ROW_LABELS_AND_IDENTITY = ['row-aria-label', 'row-track-by'];

/** The examples DAT-024.S6 adds for frozen columns, frozen rows and scrolling, by slug. */
const FROZEN_AND_SCROLL = ['frozen-columns', 'frozen-columns-both', 'frozen-rows', 'scroll-horizontal', 'scroll-flexible'];

/** The examples DAT-024.S7 covers for the fit and expand resize modes, the column toggle, column groups and column reorder, by slug. */
const RESIZE_TOGGLE_GROUPS = ['column-resize', 'column-resize-expand', 'column-toggle', 'column-groups', 'column-reorder'];

/** The examples DAT-024.S10 adds for row editing, cell editing with selection, row-span grouping and expandable row groups, by slug. */
const ROW_EDITING_AND_GROUPS = ['edit-row', 'edit-cell-selection', 'row-group-rowspan', 'row-group-expandable'];

/** The example DAT-024.S15 adds for paginator position and page report options, by slug. */
const PAGINATOR_OPTIONS = ['paginator-options'];

interface SectionReport {
  id: string;
  proseLength: number;
  demos: number;
  codeBlocks: number;
}

/**
 * Reads the "On this page" examples (nested under "Examples") and the `[id^="example-"]` anchors of the page.
 * A section runs from its anchor to the next example anchor, or to the API reference.
 */
async function readPage(page: import('@playwright/test').Page, slugPrefix = 'app-data-table-') {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PAGE);
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc).toBeVisible();

  return page.evaluate((prefix) => {
    const nav = document.querySelector('nav[aria-label="On this page"]')!;
    const tocIds = Array.from(nav.querySelectorAll('ul ul a')).map((a) => (a.getAttribute('href') ?? '').split('#')[1] ?? '');
    const anchors = Array.from(document.querySelectorAll<HTMLElement>('article [id^="example-"]'));
    const end = document.getElementById('api-reference');
    const sections: SectionReport[] = anchors.map((anchor, index) => {
      const range = document.createRange();
      range.setStartBefore(anchor);
      const next = anchors[index + 1] ?? end;
      if (next) range.setEndBefore(next);
      else range.setEndAfter(anchor);
      const fragment = range.cloneContents();
      const prose = Array.from(fragment.querySelectorAll('app-prose')).map((el) => (el.textContent ?? '').trim());
      const own = anchor.matches('app-prose') ? [(anchor.textContent ?? '').trim()] : [];
      const proseLength = Math.max(0, ...prose.map((text) => text.length), ...own.map((text) => text.length));
      const slug = anchor.id.replace(/^example-/, '');
      return {
        id: anchor.id,
        proseLength,
        demos: fragment.querySelectorAll(`${prefix}${slug}-demo`).length,
        codeBlocks: fragment.querySelectorAll('app-code-block pre code').length,
      };
    });
    return { tocIds, anchorIds: anchors.map((a) => a.id), sections };
  }, slugPrefix);
}

test.describe('DataTable docs page', () => {
  // DAT-024.S1
  test('DAT-024.S1: each index entry matches one section, in the same order', async ({ page }) => {
    const { tocIds, anchorIds } = await readPage(page);
    expect(tocIds.length, 'the index lists no examples').toBeGreaterThan(0);
    expect(new Set(anchorIds).size, 'duplicate example ids on the page').toBe(anchorIds.length);
    expect(tocIds).toEqual(anchorIds);
  });

  // DAT-024.S2
  test('DAT-024.S2: every example has prose, a live demo and a code block', async ({ page }) => {
    const { tocIds, sections } = await readPage(page);
    expect(tocIds.length, 'the index lists no examples').toBeGreaterThan(0);
    for (const id of tocIds) {
      const section = sections.find((s) => s.id === id);
      expect(section, `no section for index entry "${id}"`).toBeDefined();
      expect(section!.proseLength, `"${id}" has no prose`).toBeGreaterThan(0);
      expect(section!.demos, `"${id}" has no demo "app-data-table-${id.replace(/^example-/, '')}-demo"`).toBe(1);
      expect(section!.codeBlocks, `"${id}" has no code block`).toBeGreaterThanOrEqual(1);
    }
  });

  // DAT-024.S3
  test('DAT-024.S3: the previously documented features still have a section with a demo', async ({ page }) => {
    const { anchorIds, sections } = await readPage(page);
    for (const slug of PRE_EXISTING) {
      expect(anchorIds, `no section for "${slug}"`).toContain(`example-${slug}`);
      expect(sections.find((s) => s.id === `example-${slug}`)!.demos, `no demo for "${slug}"`).toBe(1);
    }
  });

  // DAT-024.S4
  test('DAT-024.S4: radio selection, size, grid lines, striped rows and keyboard navigation each have a section with a demo', async ({
    page,
  }) => {
    const { anchorIds, sections } = await readPage(page);
    for (const slug of NEW_APPEARANCE_AND_SELECTION) {
      expect(anchorIds, `no section for "${slug}"`).toContain(`example-${slug}`);
      expect(sections.find((s) => s.id === `example-${slug}`)!.demos, `no demo for "${slug}"`).toBe(1);
    }
  });

  // DAT-024.S5
  test('DAT-024.S5: row labels and row identity each have a section with prose, a demo and a code block', async ({ page }) => {
    const { anchorIds, sections } = await readPage(page);
    for (const slug of ROW_LABELS_AND_IDENTITY) {
      expect(anchorIds, `no section for "${slug}"`).toContain(`example-${slug}`);
      const section = sections.find((s) => s.id === `example-${slug}`)!;
      expect(section.proseLength, `no prose for "${slug}"`).toBeGreaterThan(0);
      expect(section.demos, `no demo for "${slug}"`).toBe(1);
      expect(section.codeBlocks, `no code block for "${slug}"`).toBeGreaterThanOrEqual(1);
    }
  });

  // DAT-024.S6
  test('DAT-024.S6: frozen and scroll features each have a section with prose, a demo and a code block', async ({ page }) => {
    const { anchorIds, sections } = await readPage(page);
    for (const slug of FROZEN_AND_SCROLL) {
      expect(anchorIds, `no section for "${slug}"`).toContain(`example-${slug}`);
      const section = sections.find((s) => s.id === `example-${slug}`)!;
      expect(section.proseLength, `no prose for "${slug}"`).toBeGreaterThan(0);
      expect(section.demos, `no demo for "${slug}"`).toBe(1);
      expect(section.codeBlocks, `no code block for "${slug}"`).toBeGreaterThanOrEqual(1);
    }
  });

  // DAT-024.S7
  test('DAT-024.S7: the fit and expand resize modes, the column toggle and column groups each have a section with prose, a demo and a code block', async ({
    page,
  }) => {
    const { anchorIds, sections } = await readPage(page);
    for (const slug of RESIZE_TOGGLE_GROUPS) {
      expect(anchorIds, `no section for "${slug}"`).toContain(`example-${slug}`);
      const section = sections.find((s) => s.id === `example-${slug}`)!;
      expect(section.proseLength, `no prose for "${slug}"`).toBeGreaterThan(0);
      expect(section.demos, `no demo for "${slug}"`).toBe(1);
      expect(section.codeBlocks, `no code block for "${slug}"`).toBeGreaterThanOrEqual(1);
    }
  });

  // DAT-024.S10
  test('DAT-024.S10: row editing, cell editing with selection, row-span grouping and expandable row groups each have a section with prose, a demo and a code block', async ({
    page,
  }) => {
    const { anchorIds, sections } = await readPage(page);
    for (const slug of ROW_EDITING_AND_GROUPS) {
      expect(anchorIds, `no section for "${slug}"`).toContain(`example-${slug}`);
      const section = sections.find((s) => s.id === `example-${slug}`)!;
      expect(section.proseLength, `no prose for "${slug}"`).toBeGreaterThan(0);
      expect(section.demos, `no demo for "${slug}"`).toBe(1);
      expect(section.codeBlocks, `no code block for "${slug}"`).toBeGreaterThanOrEqual(1);
    }
  });

  // DAT-024.S15
  test('DAT-024.S15: the paginator options example has a section with prose, a demo and a code block', async ({ page }) => {
    const { anchorIds, sections } = await readPage(page);
    for (const slug of PAGINATOR_OPTIONS) {
      expect(anchorIds, `no section for "${slug}"`).toContain(`example-${slug}`);
      const section = sections.find((s) => s.id === `example-${slug}`)!;
      expect(section.proseLength, `no prose for "${slug}"`).toBeGreaterThan(0);
      expect(section.demos, `no demo for "${slug}"`).toBe(1);
      expect(section.codeBlocks, `no code block for "${slug}"`).toBeGreaterThanOrEqual(1);
    }
  });

  // DAT-024.S11
  test('DAT-024.S11: the column filter menu has an index entry and a section with prose, a demo and a code block', async ({ page }) => {
    const { tocIds, anchorIds, sections } = await readPage(page);
    expect(tocIds, 'no index entry for "column-filters"').toContain('example-column-filters');
    expect(anchorIds, 'no section for "column-filters"').toContain('example-column-filters');
    const section = sections.find((s) => s.id === 'example-column-filters')!;
    expect(section.proseLength, 'no prose for "column-filters"').toBeGreaterThan(0);
    expect(section.demos, 'no demo for "column-filters"').toBe(1);
    expect(section.codeBlocks, 'no code block for "column-filters"').toBeGreaterThanOrEqual(1);
    expect(anchorIds.indexOf('example-column-filters'), 'the column filter section does not follow the global filter').toBe(
      anchorIds.indexOf('example-filter-global') + 1,
    );
  });

  // DAT-027.S1
  test('DAT-027.S1: the row-aria-label demo names each row checkbox after its row', async ({ page }) => {
    await page.goto(PAGE);
    const table = page.locator('app-data-table-row-aria-label-demo med-data-table');
    await table.scrollIntoViewIfNeeded({ timeout: 5_000 });
    await expect(table.getByRole('checkbox', { name: 'Select Oscilloscope' })).toBeAttached();
    await expect(table.getByRole('checkbox', { name: 'Select row' })).toHaveCount(0);
  });

  // DAT-024.S3
  test('DAT-024.S3: multi-sort still orders by a second column on Shift+click', async ({ page }) => {
    await page.goto(PAGE);
    const table = page.locator('app-data-table-sort-multiple-demo med-data-table');
    await table.scrollIntoViewIfNeeded({ timeout: 5_000 });
    await table.getByRole('columnheader', { name: 'Name' }).click();
    await table.getByRole('columnheader', { name: 'Category' }).click({ modifiers: ['Shift'] });
    await expect(table.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', /ascending/);
    await expect(table.getByRole('columnheader', { name: 'Category' })).toHaveAttribute('aria-sort', /ascending|descending/);
  });

  // DAT-024.S3
  test('DAT-024.S3: cell editing still opens an editor on double-click', async ({ page }) => {
    await page.goto(PAGE);
    const table = page.locator('app-data-table-edit-cell-demo med-data-table');
    await table.scrollIntoViewIfNeeded({ timeout: 5_000 });
    await table.locator('tbody tr').first().locator('td').last().dblclick();
    await expect(table.locator('tbody input').first()).toBeVisible();
  });

  // DAT-024.S3
  test('DAT-024.S3: CSV export still downloads a file', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-export-csv-demo');
    await demo.scrollIntoViewIfNeeded({ timeout: 5_000 });
    const download = page.waitForEvent('download');
    await demo.getByRole('button', { name: 'Export CSV' }).click();
    expect((await download).suggestedFilename()).toMatch(/\.csv$/);
  });
});
