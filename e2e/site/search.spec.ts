import { expect, test } from '@playwright/test';

test.describe('Global search', () => {
  // SITE-012.S1
  test('SITE-012.S1: opens with Ctrl+K and focuses the text field', async ({ page }) => {
    await page.goto('/docs/components/button');

    await page.keyboard.press('Control+k');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox').or(dialog.getByRole('combobox'))).toBeFocused();
  });

  // SITE-012.S1 (header control)
  test('SITE-012.S1: opens from the header search control', async ({ page }) => {
    await page.goto('/docs');

    await page.getByRole('banner').getByRole('button', { name: /search/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
  });

  // SITE-012.S2
  test('SITE-012.S2: navigates to the chosen result and closes the dialog', async ({ page }) => {
    await page.goto('/docs');
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('searchbox').or(dialog.getByRole('combobox')).fill('datatable');

    await expect(dialog.getByRole('option').first()).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/docs\/components\/data-table$/);
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  // SITE-012.S3
  test('SITE-012.S3: closes with Escape without navigating', async ({ page }) => {
    await page.goto('/docs/components/button');
    const url = page.url();
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).toBeHidden();
    expect(page.url()).toBe(url);
  });

  // SITE-012.S4
  test('SITE-012.S4: treats the query as literal text and runs no script', async ({ page }) => {
    const payload = '<img src=x onerror=alert(1)>';
    let dialogFired = false;
    page.on('dialog', async (d) => {
      dialogFired = true;
      await d.dismiss();
    });
    await page.goto('/docs');
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog');
    const field = dialog.getByRole('searchbox').or(dialog.getByRole('combobox'));

    await field.fill(payload);

    await expect(field).toHaveValue(payload);
    await expect(dialog.locator('img[src="x"]')).toHaveCount(0);
    await page.waitForTimeout(300);
    expect(dialogFired).toBe(false);
  });

  // SITE-012.S5
  test('SITE-012.S5: makes no request to a different origin', async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://localhost:3000').origin;
    const foreign: string[] = [];
    await page.goto('/docs');
    page.on('request', (req) => {
      if (/^https?:/.test(req.url()) && new URL(req.url()).origin !== origin) foreign.push(req.url());
    });

    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('searchbox').or(dialog.getByRole('combobox')).fill('button');
    await expect(dialog.getByRole('option').first()).toBeVisible();

    expect(foreign).toEqual([]);
  });

  // M-03
  test('M-03: shows an empty result list when the index is unavailable', async ({ page }) => {
    await page.route('**/search-index.json', (route) => route.fulfill({ status: 500, body: 'nope' }));
    await page.goto('/docs');
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog');

    await dialog.getByRole('searchbox').or(dialog.getByRole('combobox')).fill('button');

    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('option')).toHaveCount(0);
  });
});
