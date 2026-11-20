import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';

/**
 * Real-browser scenarios for DAT-036.S1, DAT-036.S3, DAT-037.S2 and DAT-024.S10.
 *
 * The demo contracts these tests rely on:
 * - `row-group-rowspan` (`app-data-table-row-group-rowspan-demo`): `rowGroupMode="rowspan"` with `groupRowsBy` on a
 *   `category` column, a `#rowexpansion` template and a "Show <name>" / "Hide <name>" button in the name column.
 * - `row-group-expandable` (`app-data-table-row-group-expandable-demo`): `rowGroupMode="subheader"` with
 *   `expandableRowGroups`, default toggle labels ("Collapse group X" / "Expand group X") and at least two groups.
 */
const rowspanDemo = (page: import('@playwright/test').Page) => page.locator('app-data-table-row-group-rowspan-demo');
const expandableDemo = (page: import('@playwright/test').Page) => page.locator('app-data-table-row-group-expandable-demo');

test.describe('DataTable row groups', () => {
  // DAT-024.S10, DAT-036.S1
  test("DAT-036.S1: a merged cell spans exactly the height of its group's rows", async ({ page }) => {
    await page.goto(PAGE);
    const demo = rowspanDemo(page);
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const merged = demo.locator('tbody td[rowspan]').first();
    await expect(merged).toBeVisible();
    const span = Number(await merged.getAttribute('rowspan'));
    expect(span, 'the first group merges several rows').toBeGreaterThan(1);

    const rows = demo.locator('tbody tr');
    const mergedBox = (await merged.boundingBox())!;
    const firstRowBox = (await rows.nth(0).boundingBox())!;
    const lastRowBox = (await rows.nth(span - 1).boundingBox())!;
    expect(Math.abs(mergedBox.y - firstRowBox.y), 'the merged cell starts at the first row of its group').toBeLessThanOrEqual(1);
    expect(
      Math.abs(mergedBox.y + mergedBox.height - (lastRowBox.y + lastRowBox.height)),
      'the merged cell ends at the last row of its group',
    ).toBeLessThanOrEqual(1);
  });

  // DAT-036.S3
  test('DAT-036.S3: an expanded row inside a group keeps the table aligned', async ({ page }) => {
    await page.goto(PAGE);
    const demo = rowspanDemo(page);
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const merged = demo.locator('tbody td[rowspan]').first();
    const spanBefore = Number(await merged.getAttribute('rowspan'));
    const firstRow = demo.locator('tbody tr').first();
    await firstRow.getByRole('button', { name: /^Show / }).click();
    await expect(firstRow.getByRole('button', { name: /^Hide / })).toBeVisible();

    expect(Number(await merged.getAttribute('rowspan')), 'the expansion row extends the span').toBe(spanBefore + 1);

    const expansionRow = demo.locator('tbody tr').nth(1);
    const expansionCell = expansionRow.locator('td[colspan]');
    await expect(expansionCell).toBeVisible();
    const tableBox = (await demo.locator('table').boundingBox())!;
    const mergedBox = (await merged.boundingBox())!;
    const expansionBox = (await expansionCell.boundingBox())!;
    expect(expansionBox.x, 'the expansion cell starts after the merged column').toBeGreaterThanOrEqual(mergedBox.x + mergedBox.width - 1);
    expect(expansionBox.x + expansionBox.width, 'the expansion cell ends at the table edge').toBeLessThanOrEqual(tableBox.x + tableBox.width + 1);
  });

  // DAT-024.S10, DAT-037.S2
  test('DAT-037.S2: Enter on the focused toggle collapses and expands a group', async ({ page }) => {
    await page.goto(PAGE);
    const demo = expandableDemo(page);
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const toggle = demo.getByRole('button', { name: /^Collapse group / }).first();
    const rowsBefore = await demo.locator('tbody tr').count();
    await toggle.focus();
    await page.keyboard.press('Enter');

    await expect(demo.getByRole('button', { name: /^Expand group / }).first()).toHaveAttribute('aria-expanded', 'false');
    expect(await demo.locator('tbody tr').count(), 'the collapsed group hides its rows').toBeLessThan(rowsBefore);

    await demo.getByRole('button', { name: /^Expand group / }).first().focus();
    await page.keyboard.press('Enter');
    await expect(demo.locator('tbody tr'), 'the expanded group shows its rows again').toHaveCount(rowsBefore);
  });
});
