import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';

/**
 * Regression scenarios for the paginator inside `med-data-table`, measured on the live docs demos.
 */
test.describe('DataTable pagination', () => {
  test('changing rows per page updates the visible rows and the page count (lazy demo)', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-lazy-demo');
    await expect(demo.locator('tbody tr')).toHaveCount(5);

    await demo.getByLabel('Rows per page').selectOption('10');

    await expect(demo.locator('tbody tr')).toHaveCount(10);
    // 83 records at 10 rows per page: nine pages, so five links remain in the window and the window now ends at page 5.
    await expect(demo.getByRole('button', { name: 'Page 9' })).toHaveCount(0);
    await expect(demo.getByRole('button', { name: 'Page 5' })).toBeVisible();
  });

  test('a restored page keeps exactly one current page in the paginator (persisted state demo)', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-stateful-demo');
    const category = demo.getByRole('columnheader', { name: 'Category' });
    await category.click();
    await category.click();
    await expect(category).toHaveAttribute('aria-sort', 'descending');
    await demo.getByRole('button', { name: 'Page 2' }).click();
    await expect(demo.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');

    await page.reload();

    const restored = page.locator('app-data-table-stateful-demo');
    await expect(restored.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await expect(restored.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current', 'page');
    await expect(restored.locator('[aria-current="page"]')).toHaveCount(1);
    // Hydration must not leave the server-rendered "current page" classes on page 1 next to the restored page 2.
    const background = (name: string) => restored.getByRole('button', { name }).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await background('Page 1')).not.toBe(await background('Page 2'));
  });
});
