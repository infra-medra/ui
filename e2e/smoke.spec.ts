import { expect, test } from '@playwright/test';

test('showcase loads without errors', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Showcase/i);
});
