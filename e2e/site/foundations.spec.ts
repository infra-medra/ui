import { expect, test } from '@playwright/test';

const SLUGS = ['brand-identity', 'design-tokens', 'theming', 'accessibility', 'i18n', 'overlays', 'forms'];
const LABELS = [
  'Brand identity',
  'Design tokens',
  'Theming',
  'Accessibility',
  'Internationalization',
  'Overlays',
  'Forms',
];

test.describe('Foundations section', () => {
  // SITE-015.S1
  test('SITE-015.S1: the sidebar lists the seven foundations pages', async ({ page }) => {
    await page.goto('/docs/foundations/brand-identity');
    const sidebar = page.getByRole('navigation', { name: 'Sidebar' });

    for (const label of LABELS) {
      await expect(sidebar.getByRole('link', { name: label })).toBeVisible();
    }

    for (const slug of SLUGS) {
      const response = await page.goto(`/docs/foundations/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });

  // SITE-015.S2
  test('SITE-015.S2: the design tokens page lists the brand and surface tokens by name', async ({ page }) => {
    await page.goto('/docs/foundations/design-tokens');
    const content = page.locator('main');

    await expect(content).toContainText('brand');
    await expect(content).toContainText('surface');
  });
});
