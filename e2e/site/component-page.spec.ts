import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const BUTTON_URL = '/docs/components/button';
const PARTS = ['Examples', 'API reference', 'Accessibility', 'Theming'];

test.describe('Component page template', () => {
  // SITE-013.S1
  test('SITE-013.S1: shows Examples, API, Accessibility and Theming in order', async ({ page }) => {
    await page.goto(BUTTON_URL);
    const headings = await page.locator('main h2').allTextContents();
    const positions = PARTS.map((part) => headings.findIndex((h) => h.trim() === part));

    for (const position of positions) expect(position).toBeGreaterThanOrEqual(0);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    await expect(page.locator('main h1')).toHaveCount(1);
  });

  // SITE-013.S2
  test('SITE-013.S2: marks the API item of "On this page" as current after scrolling to it', async ({ page }) => {
    await page.goto(BUTTON_URL);
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc).toBeVisible();

    await page.getByRole('heading', { level: 2, name: 'API reference' }).scrollIntoViewIfNeeded();

    await expect(toc.getByRole('link', { name: 'API reference' })).toHaveAttribute('aria-current', 'true');
    await expect(toc.getByRole('link', { name: 'Examples' })).not.toHaveAttribute('aria-current', 'true');
  });

  // SITE-013.S3
  test('SITE-013.S3: lists every entry of content/api/button.json unchanged', async ({ page }) => {
    const entries: { name: string; type: string; default: string | null }[] = JSON.parse(
      readFileSync(join(__dirname, '../../projects/site/src/content/api/button.json'), 'utf8'),
    );
    await page.goto(BUTTON_URL);
    const api = page.locator('#api-reference');

    for (const entry of entries) {
      await expect(api.getByText(entry.name, { exact: true }).first()).toBeVisible();
    }
    await expect(api.locator('tbody tr')).toHaveCount(entries.length);
  });
});
