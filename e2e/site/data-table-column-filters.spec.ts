import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE = '/docs/components/data-table';

/**
 * Real-browser scenarios for DAT-038.S1, DAT-038.S5, DAT-039.S3 and DAT-024.S11, run against the
 * `column-filters` docs demo.
 *
 * The demo contract these tests rely on: the table has a text column "Name", a numeric column "Price" and a
 * date column "Released", each with `columnFilter`, the default English labels ("Filter {header}", "Apply",
 * "Clear") and no pagination. Its rows are exactly:
 *
 * | Name       | Price | Released   |
 * |------------|-------|------------|
 * | Widget     | 25    | 2026-03-09 |
 * | Gadget     | 40    | 2026-03-10 |
 * | Widget Pro | 60    | 2026-03-11 |
 * | Sprocket   | 12    | 2026-04-02 |
 * | Gizmo      | 85    | 2026-02-20 |
 */
const demoOf = (page: Page) => page.locator('app-data-table-column-filters-demo');

const ALL_NAMES = ['Widget', 'Gadget', 'Widget Pro', 'Sprocket', 'Gizmo'];

async function openDemo(page: Page): Promise<Locator> {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PAGE);
  const demo = demoOf(page);
  await expect(demo).toBeAttached();
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.locator('tbody tr')).toHaveCount(ALL_NAMES.length);
  return demo;
}

/** The text of the first cell of every body row, in display order. */
async function shownNames(demo: Locator): Promise<string[]> {
  return (await demo.locator('tbody tr td:first-child').allTextContents()).map((text) => text.trim());
}

const funnelOf = (demo: Locator, header: string) => demo.getByRole('button', { name: `Filter ${header}` });

/** The filter menu is a `med-popover` pane in the overlay container, outside the demo element. */
const menuOf = (page: Page, header: string) => page.getByRole('dialog', { name: `Filter ${header}` });

test.describe('DataTable column filters', () => {
  // DAT-038.S1, DAT-024.S11
  test('DAT-038.S1: typing a value in the Name menu and pressing Enter keeps only the matching rows', async ({ page }) => {
    const demo = await openDemo(page);
    const funnel = funnelOf(demo, 'Name');
    await expect(funnel).toHaveAttribute('aria-expanded', 'false');

    await funnel.click();
    const menu = menuOf(page, 'Name');
    await expect(menu).toBeVisible();
    await expect(funnel).toHaveAttribute('aria-expanded', 'true');

    const input = menu.getByRole('textbox', { name: 'Filter Name' });
    await input.fill('wid');
    await input.press('Enter');

    await expect(menu).toBeHidden();
    await expect(demo.locator('tbody tr')).toHaveCount(2);
    expect(await shownNames(demo)).toEqual(['Widget', 'Widget Pro']);
    // The active state switches the funnel icon to its solid variant and the brand text color.
    await expect(funnel).toHaveClass(/text-brand-600/);
  });

  // DAT-038.S5
  test('DAT-038.S5: Escape closes the menu without committing and returns the focus to the funnel', async ({ page }) => {
    const demo = await openDemo(page);
    const funnel = funnelOf(demo, 'Name');
    await funnel.click();
    const menu = menuOf(page, 'Name');
    await expect(menu).toBeVisible();

    await menu.getByRole('textbox', { name: 'Filter Name' }).fill('wid');
    await page.keyboard.press('Escape');

    await expect(menu).toBeHidden();
    await expect(funnel).toBeFocused();
    await expect(funnel).toHaveAttribute('aria-expanded', 'false');
    expect(await shownNames(demo)).toEqual(ALL_NAMES);
    await expect(funnel).not.toHaveClass(/text-brand-600/);
  });

  // DAT-038.S5
  test('DAT-038.S5: a click outside the menu closes it without committing and returns the focus to the funnel', async ({ page }) => {
    const demo = await openDemo(page);
    const funnel = funnelOf(demo, 'Name');
    await funnel.click();
    const menu = menuOf(page, 'Name');
    await expect(menu).toBeVisible();

    await menu.getByRole('textbox', { name: 'Filter Name' }).fill('wid');
    // A body row of the demo is outside the menu pane and has no click behavior of its own.
    await demo.locator('tbody tr').last().locator('td').first().click();

    await expect(menu).toBeHidden();
    await expect(funnel).toBeFocused();
    await expect(funnel).toHaveAttribute('aria-expanded', 'false');
    expect(await shownNames(demo)).toEqual(ALL_NAMES);
  });

  // DAT-039.S3, DAT-024.S11
  test('DAT-039.S3: a day picked in the menu date picker applies a dateIs rule without dismissing the menu', async ({ page }) => {
    const demo = await openDemo(page);
    await funnelOf(demo, 'Released').click();
    const menu = menuOf(page, 'Released');
    await expect(menu).toBeVisible();

    // Typing a date seeds the calendar on March 2026, independent of today's date.
    const dateInput = menu.locator('med-date-picker input');
    await dateInput.fill('03/09/2026');
    await menu.getByRole('button', { name: 'Toggle calendar' }).click();
    const calendar = page.getByRole('grid', { name: /March 2026/ });
    await expect(calendar).toBeVisible();

    // The grid also renders trailing April days, so "10" matches April 10 too; March 10 comes first in DOM order.
    await calendar.getByRole('gridcell', { name: '10', exact: true }).first().click();

    // The nested date picker overlay must not dismiss the filter menu.
    await expect(menu).toBeVisible();
    await expect(dateInput).toHaveValue('03/10/2026');

    await menu.getByRole('button', { name: 'Apply' }).click();
    await expect(menu).toBeHidden();
    expect(await shownNames(demo)).toEqual(['Gadget']);
  });

  // DAT-038.S7
  test('every funnel button sits inside the bounds of its own header cell', async ({ page }) => {
    const demo = await openDemo(page);
    for (const header of ['Name', 'Price', 'Released']) {
      const cell = demo.getByRole('columnheader', { name: header });
      const funnel = cell.getByRole('button', { name: `Filter ${header}` });
      await expect(funnel, `no funnel button in the "${header}" header`).toBeVisible();

      const cellBox = (await cell.boundingBox())!;
      const funnelBox = (await funnel.boundingBox())!;
      expect(funnelBox.x, `"${header}" funnel starts left of its header`).toBeGreaterThanOrEqual(cellBox.x);
      expect(funnelBox.y, `"${header}" funnel starts above its header`).toBeGreaterThanOrEqual(cellBox.y);
      expect(funnelBox.x + funnelBox.width, `"${header}" funnel overflows its header to the right`).toBeLessThanOrEqual(cellBox.x + cellBox.width);
      expect(funnelBox.y + funnelBox.height, `"${header}" funnel overflows its header below`).toBeLessThanOrEqual(cellBox.y + cellBox.height);
    }
  });

  // DAT-024.S11
  test('DAT-024.S11: applying a numeric rule in the demo reduces the rows shown', async ({ page }) => {
    const demo = await openDemo(page);
    await funnelOf(demo, 'Price').click();
    const menu = menuOf(page, 'Price');
    await expect(menu).toBeVisible();

    await menu.getByRole('spinbutton', { name: 'Filter Price' }).fill('40');
    await menu.getByRole('button', { name: 'Apply' }).click();

    await expect(menu).toBeHidden();
    expect(await shownNames(demo)).toEqual(['Gadget']);
  });
});
