import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE = '/docs/components/data-table';
const DEMO = 'app-data-table-column-header-footer-demo';
const NARROW = 400;
const WIDE = 1280;

/** The demo's `med-data-table` table element. Its columns are, in order: Item (frozen, footer "Total"), Price (`#header`, `#footer`), Status (`sortBy`), Version (`sortCompare`). */
async function openDemo(page: Page, width = WIDE): Promise<Locator> {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(PAGE);
  const demo = page.locator(DEMO);
  await expect(demo).toBeAttached();
  await demo.scrollIntoViewIfNeeded();
  // The table hydrates after the page loads; wait for its rows before reading the layout.
  await expect(demo.locator('med-data-table tbody tr').first()).toBeVisible();
  return demo;
}

/** The header cell of the Price column, which renders the `#header` template. */
const priceHeader = (demo: Locator): Locator => demo.locator('med-data-table thead th').nth(1);

/** Text of each body cell of the Price column, in displayed order. */
async function priceValues(demo: Locator): Promise<number[]> {
  const texts = await demo.locator('med-data-table tbody tr td:nth-child(2)').allTextContents();
  return texts.map((text) => Number(text.trim()));
}

/** Text of the body row cells as a comparable string, so a test can tell whether the order changed. */
async function rowOrder(demo: Locator): Promise<string[]> {
  return demo.locator('med-data-table tbody tr td:first-child').allTextContents();
}

test.describe('DataTable column header and footer templates', () => {
  // DAT-053.S1
  test('DAT-053.S1: the #header template replaces the header text and keeps the sort indicator', async ({ page }) => {
    const demo = await openDemo(page);
    const header = priceHeader(demo);

    await expect(header).toContainText('Price (USD)');
    await expect(header.getByText('Price', { exact: true })).toHaveCount(0);
    await expect(header.locator('med-icon').first()).toBeAttached();
    // The built-in sort indicator stays next to the template content.
    await expect(header.locator('med-icon[name="chevron-down"]')).toHaveCount(1);
  });

  // DAT-053.S3
  test('DAT-053.S3: a button in the #header template receives its click and key presses without sorting the column', async ({ page }) => {
    const demo = await openDemo(page);
    const header = priceHeader(demo);
    const button = header.getByRole('button', { name: 'About price' });
    const before = await rowOrder(demo);

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(header).toHaveAttribute('aria-sort', 'none');

    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Space');
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    expect(await rowOrder(demo)).toEqual(before);
    await expect(header).toHaveAttribute('aria-sort', 'none');
  });

  // DAT-054.S5
  test('DAT-054.S5: the frozen footer cell keeps the left offset of the frozen body cells after scrolling right', async ({ page }) => {
    // Stacking disables frozen columns, so the scroll check runs at a width where the table stays unstacked.
    const demo = await openDemo(page, WIDE);
    const table = demo.locator('med-data-table');
    const viewport = table.locator('[data-med-scroll-viewport]').first();
    expect(await viewport.evaluate((el) => el.scrollWidth > el.clientWidth), 'the table is wider than its viewport').toBe(true);

    await viewport.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);

    const footerCell = table.locator('tfoot [data-med-column-footer] td').first();
    const bodyCell = table.locator('tbody tr').first().locator('td').first();
    const footerBox = await footerCell.boundingBox();
    const bodyBox = await bodyCell.boundingBox();
    expect(footerBox, 'frozen footer cell is rendered').not.toBeNull();
    expect(bodyBox, 'frozen body cell is rendered').not.toBeNull();
    expect(Math.abs(footerBox!.x - bodyBox!.x)).toBeLessThanOrEqual(1);
  });

  // DAT-054.S6
  test('DAT-054.S6: while stacked the footer row is a block, the Price footer shows its label and the cell without a footer is hidden', async ({
    page,
  }) => {
    const demo = await openDemo(page, NARROW);
    const footerRow = demo.locator('med-data-table tfoot [data-med-column-footer]');
    await expect(footerRow).toHaveClass(/\bblock\b/);

    const priceFooter = footerRow.locator('td').nth(1);
    await expect(priceFooter.locator('span[aria-hidden="true"]')).toHaveText('Price');
    await expect(priceFooter).toContainText(/Sum:\s*\d+/);

    // The Status column has no footer, so its footer cell is hidden.
    await expect(footerRow.locator('td').nth(2)).toBeHidden();
  });

  // DAT-053.S2
  test('DAT-053.S2: a click on the templated header sorts ascending and Enter on the focused header sorts descending', async ({ page }) => {
    const demo = await openDemo(page);
    const header = priceHeader(demo);
    const unsorted = await priceValues(demo);
    const ascending = [...unsorted].sort((a, b) => a - b);
    const descending = [...ascending].reverse();

    // A click at the header's left padding lands on the cell itself, outside the template's button.
    await header.click({ position: { x: 4, y: 4 } });
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(await priceValues(demo)).toEqual(ascending);

    await header.focus();
    await page.keyboard.press('Enter');
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(await priceValues(demo)).toEqual(descending);
  });

  // DAT-024.S17
  test('DAT-024.S17: the column header and footer example has prose, a live demo and a code block using a #header template, a footer and sortBy', async ({
    page,
  }) => {
    await page.setViewportSize({ width: WIDE, height: 900 });
    await page.goto(PAGE);
    const section = page.locator('section#example-column-header-footer');
    await expect(section).toBeAttached();
    await section.scrollIntoViewIfNeeded();

    expect(await section.locator('app-prose').count(), 'the section has prose').toBeGreaterThan(0);
    expect(await section.locator('app-code-block pre code').count(), 'the section has a code block').toBeGreaterThanOrEqual(1);

    const demo = section.locator(DEMO);
    await expect(demo, 'the section has the live demo').toBeAttached();
    // The #header template: the Price header renders an icon and the "(USD)" suffix.
    await expect(priceHeader(demo)).toContainText('Price (USD)');
    // The column footer row.
    await expect(demo.locator('med-data-table tfoot [data-med-column-footer]')).toBeAttached();

    // The Status column sorts by its sortBy rank, so the names read Open, Blocked, Done in order.
    const status = demo.locator('med-data-table thead th').nth(2);
    await status.click();
    await expect(status).toHaveAttribute('aria-sort', 'ascending');
    const rank: Record<string, number> = { Open: 1, Blocked: 2, Done: 3 };
    const statuses = await demo.locator('med-data-table tbody tr td:nth-child(3)').allTextContents();
    const ranks = statuses.map((text) => rank[text.trim()]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});
