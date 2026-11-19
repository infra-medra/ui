import { expect, test, type Page } from '@playwright/test';

const PANEL = '.cdk-overlay-pane';
const SCROLL_HEIGHT_DEMO = 'app-autocomplete-scroll-height-demo';
const VIRTUAL_DEMO = 'app-autocomplete-virtual-scroll-demo';
const TOTAL = 10_000;

async function openPanel(page: Page, demo: string): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/docs/components/autocomplete');
  const input = page.locator(`${demo} med-autocomplete input`).first();
  await input.scrollIntoViewIfNeeded({ timeout: 5_000 });
  await input.click();
  await page.keyboard.type('a');
}

test.describe('Autocomplete panel — list height and virtual scroll', () => {
  // UI-018.S5
  test('UI-018.S5: scrollHeight caps the list at 120px and scrolls inside it', async ({ page }) => {
    await openPanel(page, SCROLL_HEIGHT_DEMO);
    const list = page.locator(`${PANEL} [role=listbox]`).first();
    await expect(list).toBeVisible({ timeout: 5_000 });

    const metrics = await list.evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    expect(metrics.height <= 120.5, `the list is ${metrics.height}px tall, above the 120px cap`).toBe(true);
    expect(metrics.scrollHeight > metrics.clientHeight, 'the list does not scroll inside itself').toBe(true);
  });

  // UI-020.S1
  test('UI-020.S1: virtual scroll keeps at most 50 rows in the DOM and scrolls through all 10,000', async ({ page }) => {
    await openPanel(page, VIRTUAL_DEMO);
    const viewport = page.locator(`${PANEL} cdk-virtual-scroll-viewport`).first();
    await expect(viewport).toBeVisible({ timeout: 5_000 });

    const rows = await page.locator(`${PANEL} [role=option]`).count();
    expect(rows > 0 && rows <= 50, `the panel renders ${rows} rows in the DOM`).toBe(true);

    const total = await viewport.evaluate((el) => (el as HTMLElement).scrollHeight);
    const rowHeight = await page.locator(`${PANEL} [role=option]`).first().evaluate((el) => el.getBoundingClientRect().height);
    expect(total >= rowHeight * TOTAL * 0.9, `the scroll extent (${total}px) does not cover ${TOTAL} rows`).toBe(true);
  });

  // UI-020.S2
  test('UI-020.S2: End moves the active suggestion to the last of 10,000 and keeps it visible', async ({ page }) => {
    await openPanel(page, VIRTUAL_DEMO);
    const viewport = page.locator(`${PANEL} cdk-virtual-scroll-viewport`).first();
    await expect(viewport).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press('End');
    const input = page.locator(`${VIRTUAL_DEMO} med-autocomplete input`).first();
    await expect(input).toHaveAttribute('aria-activedescendant', /-option-9999$/, { timeout: 5_000 });
    const activeId = (await input.getAttribute('aria-activedescendant'))!;
    const active = page.locator(`[id="${activeId}"]`);
    await expect(active).toBeVisible({ timeout: 5_000 });
    await expect(active).toContainText(String(TOTAL));

    const inside = await active.evaluate((el) => {
      const row = el.getBoundingClientRect();
      const box = el.closest('cdk-virtual-scroll-viewport')!.getBoundingClientRect();
      return row.top >= box.top - 1 && row.bottom <= box.bottom + 1;
    });
    expect(inside, 'the last suggestion is active but outside the visible list').toBe(true);
  });

  // UI-020.S3
  test('UI-020.S3: scrolling near the end emits the lazy load event with the visible range', async ({ page }) => {
    await openPanel(page, VIRTUAL_DEMO);
    const viewport = page.locator(`${PANEL} cdk-virtual-scroll-viewport`).first();
    await expect(viewport).toBeVisible({ timeout: 5_000 });

    const log = page.locator(`${VIRTUAL_DEMO} [data-testid=lazy-range]`);
    await viewport.evaluate((el) => el.scrollTo({ top: (el as HTMLElement).scrollHeight }));
    await expect(log).toHaveText(/\d+\s*[-–]\s*\d+/, { timeout: 5_000 });
  });
});
