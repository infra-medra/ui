import { expect, test } from '@playwright/test';

const THEME_KEY = 'medraui-color-scheme';

test.describe('Site header', () => {
  // SITE-009.S1
  test('SITE-009.S1: highlights the active section and links the others', async ({ page }) => {
    await page.goto('/docs/components/button');
    const nav = page.getByRole('navigation', { name: 'Sections' });

    await expect(nav.getByRole('link', { name: 'Components' })).toHaveAttribute('aria-current', 'page');

    const others = nav.getByRole('link').filter({ hasNotText: 'Components' });
    expect(await others.count()).toBeGreaterThan(0);
    for (const link of await others.all()) {
      await expect(link).not.toHaveAttribute('aria-current', 'page');
      await expect(link).toHaveAttribute('href', /^\/docs/);
    }
  });

  // SITE-009.S3
  test('SITE-009.S3: keeps the dark theme across sections', async ({ page }) => {
    await page.goto('/docs/components/button');
    await page.getByRole('button', { name: /dark mode/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    expect(await page.evaluate((k) => localStorage.getItem(k), THEME_KEY)).toBe('dark');

    await page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: 'Foundations' }).click();
    await expect(page).toHaveURL(/\/docs\/foundations\//);
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: 'Getting started' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  // SITE-009.S4
  test('SITE-009.S4: shows the library version as text, without a selector', async ({ page }) => {
    await page.goto('/docs');
    const banner = page.getByRole('banner');
    await expect(banner.getByTestId('site-version')).toHaveText(/^v?\d+\.\d+\.\d+/);
    await expect(banner.getByRole('combobox')).toHaveCount(0);
    await expect(banner.getByRole('listbox')).toHaveCount(0);
    await expect(banner.locator('select')).toHaveCount(0);
    expect(await banner.getByTestId('site-version').evaluate((el) => el.tagName)).not.toBe('BUTTON');
  });
});
