import { expect, test, type Locator } from '@playwright/test';

const PAGE = '/docs/components/data-table';

/**
 * Real-browser scenarios for DAT-028 to DAT-030. jsdom has no layout, so these measure the live docs demos:
 * `frozen-columns` freezes its first column on the left, `frozen-columns-both` freezes its first column on the
 * left and its last column on the right, `frozen-rows` shows a table with a top and a bottom frozen row, and
 * `scroll-horizontal` and `scroll-flexible` show a wide table and a table that fills its parent.
 */
const wrapperOf = (demo: Locator): Locator => demo.locator('med-data-table > div.overflow-x-auto').first();

/** Horizontal distance from a cell's edge to the wrapper's matching edge, measured from the live layout. */
async function edgeGap(cell: Locator, wrapper: Locator, edge: 'left' | 'right'): Promise<number> {
  const cellBox = await cell.boundingBox();
  const wrapperBox = await wrapper.boundingBox();
  expect(cellBox, 'cell is rendered').not.toBeNull();
  expect(wrapperBox, 'wrapper is rendered').not.toBeNull();
  return edge === 'left' ? cellBox!.x - wrapperBox!.x : wrapperBox!.x + wrapperBox!.width - (cellBox!.x + cellBox!.width);
}

test.describe('DataTable frozen columns', () => {
  // DAT-028.S1
  test('DAT-028.S1: a left frozen column stays at the left edge while the other columns scroll away', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-frozen-columns-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const wrapper = wrapperOf(demo);

    const frozenHeader = demo.locator('thead th').first();
    const scrollingHeader = demo.locator('thead th').nth(1);
    const frozenBodyCell = demo.locator('tbody tr').first().locator('td').first();
    const scrollingBodyCell = demo.locator('tbody tr').first().locator('td').nth(1);

    const overflow = await wrapper.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow, 'the table must be wider than its wrapper').toBeGreaterThan(100);
    const before = await edgeGap(scrollingHeader, wrapper, 'left');

    await wrapper.evaluate((el) => (el.scrollLeft = el.scrollWidth));

    expect(Math.abs(await edgeGap(frozenHeader, wrapper, 'left'))).toBeLessThanOrEqual(2);
    expect(Math.abs(await edgeGap(frozenBodyCell, wrapper, 'left'))).toBeLessThanOrEqual(2);
    expect(await edgeGap(scrollingHeader, wrapper, 'left')).toBeLessThan(before - 50);
    expect(await edgeGap(scrollingBodyCell, wrapper, 'left')).toBeLessThan(before - 50);
  });

  // DAT-028.S2
  test('DAT-028.S2: a right frozen column stays at the right edge while the wrapper is scrolled to the left', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-frozen-columns-both-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const wrapper = wrapperOf(demo);

    await wrapper.evaluate((el) => (el.scrollLeft = 0));

    const lastHeader = demo.locator('thead th').last();
    const lastBodyCell = demo.locator('tbody tr').first().locator('td').last();
    expect(await wrapper.evaluate((el) => el.scrollWidth - el.clientWidth), 'the table must be wider than its wrapper').toBeGreaterThan(100);
    expect(Math.abs(await edgeGap(lastHeader, wrapper, 'right'))).toBeLessThanOrEqual(2);
    expect(Math.abs(await edgeGap(lastBodyCell, wrapper, 'right'))).toBeLessThanOrEqual(2);
  });

  // DAT-028.S4
  test('DAT-028.S4: a table with a frozen column uses a fixed layout and its frozen cells have an opaque background', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-frozen-columns-demo');
    await expect(demo).toBeAttached();

    expect(await demo.locator('table').evaluate((el) => getComputedStyle(el).tableLayout)).toBe('fixed');
    for (const cell of [demo.locator('thead th').first(), demo.locator('tbody tr').first().locator('td').first()]) {
      const alpha = await cell.evaluate((el) => {
        const color = getComputedStyle(el).backgroundColor;
        const match = color.match(/rgba?\(([^)]+)\)/);
        const channels = match ? match[1].split(/[ ,/]+/).filter(Boolean) : [];
        return channels.length > 3 ? parseFloat(channels[3]) : 1;
      });
      expect(alpha, 'frozen cell background must be opaque').toBe(1);
    }
  });
});

test.describe('DataTable frozen rows', () => {
  /** Vertical distance from a frozen row's edge to the matching edge of the scrolling wrapper, from the live layout. */
  async function verticalGap(row: Locator, wrapper: Locator, edge: 'top' | 'bottom'): Promise<number> {
    const rowBox = await row.boundingBox();
    const wrapperBox = await wrapper.boundingBox();
    expect(rowBox, 'frozen row is rendered').not.toBeNull();
    expect(wrapperBox, 'wrapper is rendered').not.toBeNull();
    return edge === 'top' ? rowBox!.y - wrapperBox!.y : wrapperBox!.y + wrapperBox!.height - (rowBox!.y + rowBox!.height);
  }

  // DAT-029.S3
  test('DAT-029.S3: top frozen rows stay directly under the header while the wrapper scrolls vertically', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-frozen-rows-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const table = demo.locator('med-data-table').first();
    const wrapper = table.locator('> div.overflow-y-auto').first();
    const headerHeight = await table.locator('thead').evaluate((el) => el.getBoundingClientRect().height);
    const frozenRow = table.locator('tbody').first().locator('tr').first();

    expect(await wrapper.evaluate((el) => el.scrollHeight - el.clientHeight), 'the rows must overflow the wrapper').toBeGreaterThan(50);
    await wrapper.evaluate((el) => (el.scrollTop = el.scrollHeight));

    expect(Math.abs((await verticalGap(frozenRow, wrapper, 'top')) - headerHeight)).toBeLessThanOrEqual(2);
  });

  // DAT-029.S6
  test('DAT-029.S6: bottom frozen rows stay at the bottom edge of the wrapper while it is scrolled to the top', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-frozen-rows-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const table = demo.locator('med-data-table').nth(1);
    const wrapper = table.locator('> div.overflow-y-auto').first();
    const frozenRow = table.locator('tbody').last().locator('tr').last();

    expect(await wrapper.evaluate((el) => el.scrollHeight - el.clientHeight), 'the rows must overflow the wrapper').toBeGreaterThan(50);
    await wrapper.evaluate((el) => (el.scrollTop = 0));

    expect(Math.abs(await verticalGap(frozenRow, wrapper, 'bottom'))).toBeLessThanOrEqual(2);
  });
});

test.describe('DataTable horizontal and flexible scroll', () => {
  // DAT-030.S1
  test('DAT-030.S1: a wide table scrolls inside its wrapper and the page does not scroll horizontally', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-scroll-horizontal-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const wrapper = wrapperOf(demo);

    expect(await wrapper.evaluate((el) => el.scrollWidth - el.clientWidth), 'the table must be wider than its wrapper').toBeGreaterThan(100);
    expect(await wrapper.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });

  // DAT-030.S2
  test('DAT-030.S2: scrollHeight flex makes the wrapper as tall as its parent and scroll vertically with a sticky header', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-scroll-flexible-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const wrapper = wrapperOf(demo);
    const parent = demo.locator('med-data-table').first().locator('..');

    const parentHeight = (await parent.boundingBox())!.height;
    const wrapperHeight = (await wrapper.boundingBox())!.height;
    expect(Math.abs(parentHeight - wrapperHeight)).toBeLessThanOrEqual(2);
    expect(await wrapper.evaluate((el) => el.scrollHeight - el.clientHeight), 'the rows must overflow the wrapper').toBeGreaterThan(50);

    await wrapper.evaluate((el) => (el.scrollTop = el.scrollHeight));
    const headerGap = (await demo.locator('thead').boundingBox())!.y - (await wrapper.boundingBox())!.y;
    expect(Math.abs(headerGap)).toBeLessThanOrEqual(2);
  });
});

test.describe('DataTable frozen column with utility columns', () => {
  // DAT-024.S8
  test('DAT-024.S8: the reorder handle, the selection column and the frozen data column stay in view on horizontal scroll', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-frozen-columns-utility-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const wrapper = wrapperOf(demo);

    const firstRow = demo.locator('tbody tr').first();
    // Reorder handle cell, selection checkbox cell and the frozen data cell are the first three cells of a row.
    const utilityCells = [firstRow.locator('td').nth(0), firstRow.locator('td').nth(1), firstRow.locator('td').nth(2)];
    await expect(firstRow.getByRole('checkbox')).toBeAttached();
    expect(await wrapper.evaluate((el) => el.scrollWidth - el.clientWidth), 'the table must be wider than its wrapper').toBeGreaterThan(100);

    await wrapper.evaluate((el) => (el.scrollLeft = el.scrollWidth));

    const wrapperBox = (await wrapper.boundingBox())!;
    for (const cell of utilityCells) {
      const box = (await cell.boundingBox())!;
      expect(box.x, 'cell stays inside the wrapper on the left').toBeGreaterThanOrEqual(wrapperBox.x - 2);
      expect(box.x + box.width, 'cell stays inside the wrapper on the right').toBeLessThanOrEqual(wrapperBox.x + wrapperBox.width + 2);
    }
    expect(Math.abs(await edgeGap(utilityCells[0], wrapper, 'left'))).toBeLessThanOrEqual(2);
  });
});
