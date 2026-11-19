import { expect, test } from '@playwright/test';

test.describe('Fieldset disabled cascade', () => {
  test('disabled fieldset cascades to descendant form controls in a real browser', async ({ page }) => {
    await page.goto('/');

    const disabledFieldset = page.locator('fieldset', { hasText: 'Disabled — every field below is inert' });
    await expect(disabledFieldset.locator('input[placeholder="Card number"]')).toBeDisabled();
    await expect(disabledFieldset.locator('button', { hasText: 'Save card' })).toBeDisabled();
  });

  test('enabled fieldset does not disable its descendant form controls', async ({ page }) => {
    await page.goto('/');

    const enabledFieldset = page.locator('fieldset', { hasText: 'Shipping address' });
    await expect(enabledFieldset.locator('input[placeholder="Street"]')).toBeEnabled();
    await expect(enabledFieldset.locator('input[placeholder="City"]')).toBeEnabled();
  });
});
