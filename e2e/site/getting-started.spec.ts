import { expect, test } from '@playwright/test';

test.describe('Getting started section', () => {
  // SITE-014.S1
  test('SITE-014.S1: the sidebar lists every getting-started page', async ({ page }) => {
    await page.goto('/docs/getting-started/introduction');
    const sidebar = page.getByRole('navigation', { name: 'Sidebar' });

    for (const label of ['Introduction', 'Installation', 'Quick start', 'Icons']) {
      await expect(sidebar.getByRole('link', { name: label })).toBeVisible();
    }

    for (const slug of ['introduction', 'installation', 'quick-start', 'icons']) {
      const response = await page.goto(`/docs/getting-started/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });
});
