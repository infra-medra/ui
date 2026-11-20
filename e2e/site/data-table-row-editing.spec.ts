import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';

/**
 * Real-browser scenarios for DAT-035.S1 and DAT-024.S10, run against the `edit-row` docs demo.
 *
 * The demo contract these tests rely on: `editMode="row"` is on, at least two columns are `editable` with an
 * input in their edit template, the actions column uses the default button labels ("Edit row", "Save row"), and
 * the demo prints the last saved row in an element with `data-testid="saved-row"`.
 */
const demoOf = (page: import('@playwright/test').Page) => page.locator('app-data-table-edit-row-demo');

test.describe('DataTable row editing', () => {
  // DAT-024.S10, DAT-035.S1
  test('DAT-035.S1: the edit button shows an input in every editable cell of the row at once', async ({ page }) => {
    await page.goto(PAGE);
    const demo = demoOf(page);
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const firstRow = demo.locator('tbody tr').first();
    await expect(firstRow.locator('input')).toHaveCount(0);
    await firstRow.getByRole('button', { name: 'Edit row' }).click();

    expect(await firstRow.locator('input').count(), 'every editable cell shows its edit template').toBeGreaterThanOrEqual(2);
    await expect(firstRow.getByRole('button', { name: 'Save row' })).toBeVisible();
    await expect(demo.locator('tbody tr').nth(1).locator('input')).toHaveCount(0);
  });

  // DAT-035.S1
  test('DAT-035.S1: saving returns the row to display mode and reports the edited values', async ({ page }) => {
    await page.goto(PAGE);
    const demo = demoOf(page);
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const firstRow = demo.locator('tbody tr').first();
    await firstRow.getByRole('button', { name: 'Edit row' }).click();
    const nameInput = firstRow.locator('input').first();
    await nameInput.fill('Edited name');
    await firstRow.getByRole('button', { name: 'Save row' }).click();

    await expect(firstRow.locator('input')).toHaveCount(0);
    await expect(firstRow).toContainText('Edited name');
    await expect(demo.getByTestId('saved-row')).toContainText('Edited name');
  });
});
