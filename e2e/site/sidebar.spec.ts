import { expect, test } from '@playwright/test';

test.describe('Site sidebar', () => {
  // SITE-010.S3
  test('SITE-010.S3: collapses a group from the keyboard and exposes the state', async ({ page }) => {
    await page.goto('/docs/components/button');
    const sidebar = page.getByRole('navigation', { name: 'Sidebar' });
    const header = sidebar.getByRole('button', { name: 'Form / input' });

    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(sidebar.getByRole('link', { name: 'Checkbox' })).toBeVisible();

    await header.focus();
    await page.keyboard.press('Enter');

    await expect(header).toHaveAttribute('aria-expanded', 'false');
    await expect(sidebar.getByRole('link', { name: 'Checkbox' })).toBeHidden();

    await page.keyboard.press('Space');
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(sidebar.getByRole('link', { name: 'Checkbox' })).toBeVisible();
  });

  // SITE-010.S2
  test('SITE-010.S2: tells the user when the filter matches no item', async ({ page }) => {
    await page.goto('/docs/components/button');
    const sidebar = page.getByRole('navigation', { name: 'Sidebar' });

    // The prerendered input exists before hydration; retry until the app handles the input event.
    await expect(async () => {
      await sidebar.getByPlaceholder('Filter…').fill('zzzz-no-such-page');
      await expect(sidebar.getByRole('status')).toHaveText('No items found.', { timeout: 1000 });
    }).toPass();
    await expect(sidebar.getByRole('link')).toHaveCount(0);
  });
});
