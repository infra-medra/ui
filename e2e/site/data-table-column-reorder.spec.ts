import { expect, test, type Locator } from '@playwright/test';

const PAGE = '/docs/components/data-table';

/**
 * Real-browser scenarios for DAT-034 and DAT-024.S9, run against the `column-reorder` docs demo.
 *
 * The demo contract these tests rely on: `reorderableColumns` is on, the first two columns are frozen on the left
 * and reorderable, followed by free reorderable columns, and the last column is pinned with `reorderable` false.
 */
const demoOf = (page: import('@playwright/test').Page): Locator => page.locator('app-data-table-column-reorder-demo');

/** Visible header labels of the demo table, in DOM order. */
async function headerLabels(demo: Locator): Promise<string[]> {
  const labels = await demo.locator('thead th[scope="col"]').allInnerTexts();
  return labels.map((label) => label.trim());
}

/** Horizontal distance from a cell's left edge to its wrapper's left edge, from the live layout. */
async function leftGap(cell: Locator, wrapper: Locator): Promise<number> {
  const cellBox = await cell.boundingBox();
  const wrapperBox = await wrapper.boundingBox();
  expect(cellBox, 'cell is rendered').not.toBeNull();
  expect(wrapperBox, 'wrapper is rendered').not.toBeNull();
  return cellBox!.x - wrapperBox!.x;
}

test.describe('DataTable column reorder', () => {
  // DAT-024.S9, DAT-034.S1
  test('DAT-034.S1: dragging a header onto another header moves the column in the header and every body row', async ({ page }) => {
    await page.goto(PAGE);
    const demo = demoOf(page);
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const before = await headerLabels(demo);
    expect(before.length, 'the demo needs several columns').toBeGreaterThanOrEqual(4);
    const firstBodyRowBefore = await demo.locator('tbody tr').first().locator('td').allInnerTexts();

    // Move the third column (free, reorderable) onto the fourth.
    const from = demo.locator('thead th[scope="col"]').nth(2);
    const to = demo.locator('thead th[scope="col"]').nth(3);
    await from.dragTo(to);

    const after = await headerLabels(demo);
    expect(after).toEqual([before[0], before[1], before[3], before[2], ...before.slice(4)]);

    const firstBodyRowAfter = await demo.locator('tbody tr').first().locator('td').allInnerTexts();
    expect(firstBodyRowAfter[2]).toBe(firstBodyRowBefore[3]);
    expect(firstBodyRowAfter[3]).toBe(firstBodyRowBefore[2]);
  });

  // DAT-034.S5
  test('DAT-034.S5: moving one frozen column onto another keeps both frozen with recomputed sticky offsets', async ({ page }) => {
    await page.goto(PAGE);
    const demo = demoOf(page);
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const wrapper = demo.locator('med-data-table [data-med-scroll-viewport]').first();

    const before = await headerLabels(demo);
    const firstHeader = demo.locator('thead th[scope="col"]').nth(0);
    const secondHeader = demo.locator('thead th[scope="col"]').nth(1);
    await firstHeader.dragTo(secondHeader);

    const after = await headerLabels(demo);
    expect(after.slice(0, 2)).toEqual([before[1], before[0]]);

    await expect(demo.locator('thead th[scope="col"]').nth(0)).toHaveCSS('position', 'sticky');
    await expect(demo.locator('thead th[scope="col"]').nth(1)).toHaveCSS('position', 'sticky');

    // Scrolled all the way right, the two frozen columns stay at the left edge, one after the other.
    expect(await wrapper.evaluate((el) => el.scrollWidth - el.clientWidth), 'the table must be wider than its wrapper').toBeGreaterThan(50);
    await wrapper.evaluate((el) => (el.scrollLeft = el.scrollWidth));
    const headers = demo.locator('thead th[scope="col"]');
    const firstWidth = (await headers.nth(0).boundingBox())!.width;
    expect(Math.abs(await leftGap(headers.nth(0), wrapper))).toBeLessThanOrEqual(2);
    expect(Math.abs((await leftGap(headers.nth(1), wrapper)) - firstWidth)).toBeLessThanOrEqual(2);
    const bodyCells = demo.locator('tbody tr').first().locator('td');
    expect(Math.abs(await leftGap(bodyCells.nth(0), wrapper))).toBeLessThanOrEqual(2);
  });

  // DAT-034.S8
  test('DAT-034.S8: Alt+ArrowRight moves the focused column one position and keeps focus on its header', async ({ page }) => {
    await page.goto(PAGE);
    const demo = demoOf(page);
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const before = await headerLabels(demo);
    const header = demo.locator('thead th[scope="col"]').nth(2);
    await header.focus();
    await page.keyboard.press('Alt+ArrowRight');

    const after = await headerLabels(demo);
    expect(after).toEqual([before[0], before[1], before[3], before[2], ...before.slice(4)]);

    const movedHeader = demo.locator('thead th[scope="col"]').nth(3);
    await expect(movedHeader).toContainText(before[2]);
    await expect(movedHeader).toBeFocused();
  });
});
