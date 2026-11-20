import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';

/**
 * Computed-style scenarios for DAT-025. jsdom cannot resolve Tailwind classes, so they measure the live docs demos:
 * `size` shows a `sm` table first and a `lg` table last, `grid-lines` shows a table with `showGridlines`,
 * `striped-rows` shows a table with `stripedRows`, and `basic` is a plain table without any of the three inputs.
 */
test.describe('DataTable appearance', () => {
  // DAT-025.S1
  test('DAT-025.S1: a lg table has more cell padding and a larger text size than a sm table', async ({ page }) => {
    await page.goto(PAGE);
    const tables = page.locator('app-data-table-size-demo med-data-table');
    await expect(tables.first()).toBeAttached();
    expect(await tables.count(), 'the size demo needs at least a sm and a lg table').toBeGreaterThanOrEqual(2);

    const padding = (table: ReturnType<typeof tables.first>) =>
      table.locator('tbody tr').first().locator('td').first().evaluate((td) => {
        const style = getComputedStyle(td);
        return parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      });

    const fontSize = (table: ReturnType<typeof tables.first>) =>
      table.locator('tbody tr').first().locator('td').first().evaluate((td) => parseFloat(getComputedStyle(td).fontSize));

    const small = await padding(tables.first());
    const large = await padding(tables.last());
    expect(large).toBeGreaterThan(small);
    expect(await fontSize(tables.last())).toBeGreaterThan(await fontSize(tables.first()));
  });

  // DAT-025.S2
  test('DAT-025.S2: showGridlines draws side borders on body cells and a plain table has none', async ({ page }) => {
    await page.goto(PAGE);
    const sideBorders = (table: import('@playwright/test').Locator) =>
      table.locator('tbody tr').first().locator('td').first().evaluate((td) => {
        const style = getComputedStyle(td);
        return {
          left: parseFloat(style.borderLeftWidth) > 0 && style.borderLeftStyle !== 'none',
          right: parseFloat(style.borderRightWidth) > 0 && style.borderRightStyle !== 'none',
        };
      });

    const grid = page.locator('app-data-table-grid-lines-demo med-data-table').first();
    await expect(grid).toBeAttached();
    const plain = page.locator('app-data-table-basic-demo med-data-table').first();
    await expect(plain).toBeAttached();

    const withGrid = await sideBorders(grid);
    expect(withGrid.left || withGrid.right, 'gridlines table has no side border').toBe(true);
    expect(await sideBorders(plain)).toEqual({ left: false, right: false });
  });

  // DAT-025.S3
  test('DAT-025.S3: stripedRows gives the first and second body rows different backgrounds', async ({ page }) => {
    await page.goto(PAGE);
    const rows = page.locator('app-data-table-striped-rows-demo med-data-table tbody tr');
    await expect(rows.first()).toBeAttached();
    expect(await rows.count()).toBeGreaterThanOrEqual(2);

    const background = (row: ReturnType<typeof rows.first>) =>
      row.evaluate((tr) => getComputedStyle(tr).backgroundColor);

    const first = await background(rows.nth(0));
    const second = await background(rows.nth(1));
    expect(first).not.toBe(second);
  });
});
