import { expect, test } from '@playwright/test';

test.describe('Main routes', () => {
  // SITE-001.S1
  test('SITE-001.S1: /docs renders the documentation page', async ({ page }) => {
    const response = await page.goto('/docs');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Sidebar' })).toBeVisible();
  });
});
