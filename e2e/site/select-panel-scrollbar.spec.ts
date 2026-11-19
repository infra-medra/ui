import { expect, test, type Locator, type Page } from '@playwright/test';

// Real (non-overlay) scrollbars: headless Chromium hides them by default, which would leave nothing to grab.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--disable-features=OverlayScrollbar'] } });

const PANEL = '.cdk-overlay-pane';

interface ScrollerGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  verticalBar: number;
  horizontalBar: number;
}

async function geometryOf(scroller: Locator): Promise<ScrollerGeometry> {
  return scroller.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      verticalBar: (el as HTMLElement).offsetWidth - el.clientWidth,
      horizontalBar: (el as HTMLElement).offsetHeight - el.clientHeight,
    };
  });
}

async function panelCount(page: Page): Promise<number> {
  return page.locator(PANEL).count();
}

/** Presses on the vertical scrollbar of `scroller`, drags it to the bottom and returns whether the panel survived the whole gesture. */
async function dragVerticalBar(page: Page, scroller: Locator): Promise<{ openDuringDrag: boolean; openAfter: boolean; bar: number }> {
  const g = await geometryOf(scroller);
  const x = g.x + g.width - g.verticalBar / 2;
  await page.mouse.move(x, g.y + 15);
  await page.mouse.down();
  await page.mouse.move(x, g.y + g.height - 15, { steps: 6 });
  const openDuringDrag = (await panelCount(page)) > 0;
  await page.mouse.up();
  return { openDuringDrag, openAfter: (await panelCount(page)) > 0, bar: g.verticalBar };
}

test.describe('Select panel scrollbar', () => {
  // UI-014.S1
  test('UI-014.S1: dragging the vertical scrollbar of the editable Select panel keeps it open and focused', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/docs/components/select');

    const input = page.locator('med-select input[role=combobox]').first();
    await input.scrollIntoViewIfNeeded();
    await input.click();
    const scroller = page.locator(`${PANEL} cdk-virtual-scroll-viewport`);
    await expect(scroller).toBeVisible();

    const result = await dragVerticalBar(page, scroller);
    expect(result.bar > 0, `the panel shows no vertical scrollbar (${result.bar}px)`).toBe(true);
    expect(result.openDuringDrag && result.openAfter, 'the panel closed while its scrollbar was pressed').toBe(true);
    expect(await scroller.evaluate((el) => el.scrollTop), 'the option list did not scroll').toBeGreaterThan(0);
    await expect(input).toBeFocused();
  });

  // UI-014.S2
  test('UI-014.S2: dragging the horizontal scrollbar of the editable Select panel keeps it open and focused', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/docs/components/select');

    const input = page.locator('med-select input[role=combobox]').first();
    await input.scrollIntoViewIfNeeded();
    await input.click();
    const scroller = page.locator(`${PANEL} cdk-virtual-scroll-viewport`);
    await expect(scroller).toBeVisible();
    // The demo options are short; give the panel content wider than itself so a horizontal scrollbar exists.
    await scroller.evaluate((el) => {
      (el as HTMLElement).style.overflowX = 'scroll';
      const content = el.querySelector('.cdk-virtual-scroll-content-wrapper') as HTMLElement | null;
      if (content) content.style.minWidth = '1200px';
    });

    const g = await geometryOf(scroller);
    expect(g.horizontalBar > 0, `the panel shows no horizontal scrollbar (${g.horizontalBar}px)`).toBe(true);
    const y = g.y + g.height - g.horizontalBar / 2;
    await page.mouse.move(g.x + 20, y);
    await page.mouse.down();
    await page.mouse.move(g.x + g.width - 30, y, { steps: 6 });
    const openDuringDrag = (await panelCount(page)) > 0;
    await page.mouse.up();

    expect(openDuringDrag && (await panelCount(page)) > 0, 'the panel closed while its horizontal scrollbar was pressed').toBe(true);
    expect(await scroller.evaluate((el) => el.scrollLeft), 'the panel did not scroll horizontally').toBeGreaterThan(0);
    await expect(input).toBeFocused();
  });

  // UI-014.S3
  test('UI-014.S3: clicking outside the panel and the field closes the editable Select panel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/docs/components/select');

    const input = page.locator('med-select input[role=combobox]').first();
    await input.scrollIntoViewIfNeeded();
    await input.click();
    await expect(page.locator(PANEL)).toBeVisible();

    await page.locator('main h1').click();
    await expect(page.locator(PANEL)).toHaveCount(0);
  });

  // UI-014.S4
  test('UI-014.S4: dragging the scrollbar of the Autocomplete panel keeps it open and focused', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/docs/components/autocomplete');

    const input = page.locator('med-autocomplete input').first();
    await input.scrollIntoViewIfNeeded();
    await input.click();
    await page.keyboard.type('a');
    const scroller = page.locator(`${PANEL} [role=listbox]`).first();
    await expect(scroller).toBeVisible();
    // The demo suggestion list is short; cap the panel height so its vertical scrollbar exists.
    await scroller.evaluate((el) => {
      (el as HTMLElement).style.maxHeight = '70px';
      (el as HTMLElement).style.overflowY = 'scroll';
    });

    const result = await dragVerticalBar(page, scroller);
    expect(result.bar > 0, `the panel shows no vertical scrollbar (${result.bar}px)`).toBe(true);
    expect(result.openDuringDrag && result.openAfter, 'the panel closed while its scrollbar was pressed').toBe(true);
    await expect(input).toBeFocused();
  });
});
