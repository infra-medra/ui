import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 375, height: 800 } });

test.describe('Mobile navigation drawer', () => {
  // SITE-011.S1
  test('SITE-011.S1: opens the drawer with the active section navigation from the header menu control', async ({
    page,
  }) => {
    await page.goto('/docs/components/button');
    const menu = page.getByRole('banner').getByRole('button', { name: /menu/i });
    await expect(menu).toBeVisible();

    await menu.click();

    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('navigation', { name: 'Sidebar' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Button', exact: true })).toBeVisible();
  });

  // SITE-011.S2
  test('SITE-011.S2: closes with Escape and returns focus to the menu control', async ({ page }) => {
    await page.goto('/docs/components/button');
    const menu = page.getByRole('banner').getByRole('button', { name: /menu/i });
    await menu.click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(drawer).toBeHidden();
    await expect(menu).toBeFocused();
  });

  // SITE-011.S3
  test('SITE-011.S3: keeps focus inside the drawer while it is open', async ({ page }) => {
    await page.goto('/docs/components/button');
    await page.getByRole('banner').getByRole('button', { name: /menu/i }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();

    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return !!dialog && dialog.contains(document.activeElement);
      });
      expect(inside, `focus escaped the drawer after ${i + 1} Tab presses`).toBe(true);
    }

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+Tab');
      const inside = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return !!dialog && dialog.contains(document.activeElement);
      });
      expect(inside, `focus escaped the drawer after ${i + 1} Shift+Tab presses`).toBe(true);
    }
  });
});
