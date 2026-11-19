import { expect, test, type Locator } from '@playwright/test';

const COMPONENT_PAGE = '/docs/components/select';
const SIDEBAR_LIST = 'aside nav[aria-label="Sidebar"] > div.overflow-y-auto';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** The computed scrollbar look of an element: thickness keyword and thumb/track colors. */
async function scrollbarOf(locator: Locator) {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el);
    return { width: style.scrollbarWidth, color: style.scrollbarColor };
  });
}

function isMinimal(look: { width: string; color: string }): boolean {
  return look.width === 'thin' && look.color !== 'auto' && look.color.endsWith(TRANSPARENT);
}

test.describe('Site scrollbars', () => {
  // SITE-019.S1
  test('SITE-019.S1: the sidebar list uses a thin scrollbar with a transparent track', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto(COMPONENT_PAGE);

    const look = await scrollbarOf(page.locator(SIDEBAR_LIST));
    expect(isMinimal(look), `sidebar scrollbar is "${look.width}" / "${look.color}"`).toBe(true);
  });

  // SITE-019.S2
  test('SITE-019.S2: code blocks, the API table and the search results use the same scrollbar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(COMPONENT_PAGE);

    const codeBlock = await scrollbarOf(page.locator('pre').first());
    expect(isMinimal(codeBlock), `code block scrollbar is "${codeBlock.width}" / "${codeBlock.color}"`).toBe(true);

    const apiTable = await scrollbarOf(page.locator('#api-reference .overflow-x-auto').first());
    expect(isMinimal(apiTable), `API table scrollbar is "${apiTable.width}" / "${apiTable.color}"`).toBe(true);

    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toBeVisible();
    const results = await scrollbarOf(page.locator('#site-search-results'));
    expect(isMinimal(results), `search results scrollbar is "${results.width}" / "${results.color}"`).toBe(true);
  });

  // SITE-019.S3
  test('SITE-019.S3: the sidebar thumb color changes with the theme', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto(COMPONENT_PAGE);

    const light = await scrollbarOf(page.locator(SIDEBAR_LIST));
    await page.getByRole('button', { name: /dark mode/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    const dark = await scrollbarOf(page.locator(SIDEBAR_LIST));

    expect(light.color !== 'auto' && dark.color !== 'auto', `thumb colors are "${light.color}" and "${dark.color}"`).toBe(true);
    expect(light.color !== dark.color, `thumb color is "${light.color}" in both themes`).toBe(true);
  });

  // SITE-019.S4
  test('SITE-019.S4: the mouse wheel scrolls the sidebar list inside the sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto(COMPONENT_PAGE);

    const list = page.locator(SIDEBAR_LIST);
    const box = await list.boundingBox();
    if (!box) throw new Error('sidebar list has no bounding box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });
});
