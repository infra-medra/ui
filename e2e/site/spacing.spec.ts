import { expect, test, type Locator } from '@playwright/test';

const COMPONENT_PAGE = '/docs/components/select';

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('element has no bounding box');
  return box;
}

test.describe('Site spacing', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(COMPONENT_PAGE);
  });

  // SITE-018.S1
  test('SITE-018.S1: the gap between the sidebar and the content is 48px', async ({ page }) => {
    const sidebar = await boxOf(page.locator('aside').first());
    const article = await boxOf(page.locator('main article').first());
    const gap = Math.round(article.x - (sidebar.x + sidebar.width));
    expect(gap === 48, `sidebar-to-content gap is ${gap}px, expected 48px`).toBe(true);
  });

  // SITE-018.S2
  test('SITE-018.S2: consecutive sections are at least 64px apart', async ({ page }) => {
    const examples = await boxOf(page.locator('#examples'));
    const nextTitle = await boxOf(page.locator('#api-reference h2'));
    const distance = Math.round(nextTitle.y - (examples.y + examples.height));
    expect(distance >= 64, `section spacing is ${distance}px, expected at least 64px`).toBe(true);
  });

  // SITE-018.S3
  test('SITE-018.S3: a section title sits no more than 12px above its text', async ({ page }) => {
    const title = await boxOf(page.locator('#accessibility h2'));
    const text = await boxOf(page.locator('#accessibility p').first());
    const distance = Math.round(text.y - (title.y + title.height));
    expect(distance > 0 && distance <= 12, `title-to-text distance is ${distance}px, expected 1 to 12px`).toBe(true);
  });
});
