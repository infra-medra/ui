import { expect, test } from '@playwright/test';

const PANEL = '.cdk-overlay-pane';
const VIRTUAL_DEMO = 'app-autocomplete-virtual-scroll-demo';
/** The default `scrollHeight` of the autocomplete panel: 15rem at the 16px root font size. */
const DEFAULT_SCROLL_HEIGHT = 240;

test.describe('Autocomplete panel — virtual list scrollbar', () => {
  // UI-020.S4
  test('UI-020.S4: a virtual list shows a single vertical scrollbar and stays within scrollHeight', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/docs/components/autocomplete');
    const input = page.locator(`${VIRTUAL_DEMO} med-autocomplete input`).first();
    await input.scrollIntoViewIfNeeded({ timeout: 5_000 });
    await input.click();
    await page.keyboard.type('a');

    const list = page.locator(`${PANEL} [role=listbox]`).first();
    const viewport = page.locator(`${PANEL} cdk-virtual-scroll-viewport`).first();
    await expect(viewport).toBeVisible({ timeout: 5_000 });

    const outer = await list.evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    const inner = await viewport.evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));

    expect(
      outer.scrollHeight <= outer.clientHeight + 1,
      `the outer list scrolls on its own (${outer.scrollHeight}px of content in ${outer.clientHeight}px): a second scrollbar`,
    ).toBe(true);
    expect(inner.scrollHeight > inner.clientHeight, 'the virtual viewport does not scroll').toBe(true);
    expect(
      outer.height <= DEFAULT_SCROLL_HEIGHT + 0.5,
      `the panel list is ${outer.height}px tall, above the ${DEFAULT_SCROLL_HEIGHT}px scrollHeight`,
    ).toBe(true);
  });
});
