import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE = '/docs/components/data-table';

/**
 * Real-browser scenarios for DAT-031. jsdom has no layout, so these drag the resize handles of the live docs demos:
 * `column-resize` uses the default `fit` mode and `column-resize-expand` sets `columnResizeMode="expand"`.
 */
async function widthOf(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  expect(box, 'element is rendered').not.toBeNull();
  return box!.width;
}

/** Drags the resize handle of the header at `index` by `dx` pixels with the mouse. */
async function dragHandle(page: Page, demo: Locator, index: number, dx: number): Promise<void> {
  const handle = demo.locator('thead th').nth(index).locator('[data-col-resize-handle="true"]');
  const box = await handle.boundingBox();
  expect(box, 'resize handle is rendered').not.toBeNull();
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y);
  await page.mouse.move(x + dx, y);
  await page.mouse.up();
}

test.describe('DataTable column resize modes', () => {
  // DAT-031.S1
  test('DAT-031.S1: fit mode trades width between the dragged column and its right neighbour', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-column-resize-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const headers = demo.locator('thead th');

    const [first, second, tableWidth] = [await widthOf(headers.nth(0)), await widthOf(headers.nth(1)), await widthOf(demo.locator('table'))];
    await dragHandle(page, demo, 0, 50);

    expect(await widthOf(headers.nth(0))).toBeCloseTo(first + 50, 0);
    expect(await widthOf(headers.nth(1))).toBeCloseTo(second - 50, 0);
    expect(await widthOf(demo.locator('table'))).toBeCloseTo(tableWidth, 0);
  });

  // DAT-031.S4
  test('DAT-031.S4: expand mode changes only the dragged column and widens the table', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-column-resize-expand-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    const headers = demo.locator('thead th');

    const [first, second, third, tableWidth] = [await widthOf(headers.nth(0)), await widthOf(headers.nth(1)), await widthOf(headers.nth(2)), await widthOf(demo.locator('table'))];
    await dragHandle(page, demo, 0, 50);

    expect(await widthOf(headers.nth(0))).toBeCloseTo(first + 50, 0);
    expect(await widthOf(headers.nth(1))).toBeCloseTo(second, 0);
    expect(await widthOf(headers.nth(2))).toBeCloseTo(third, 0);
    expect(await widthOf(demo.locator('table'))).toBeCloseTo(tableWidth + 50, 0);
  });
});
