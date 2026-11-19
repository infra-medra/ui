import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE = '/docs/components/multi-select';
const PANEL = '.cdk-overlay-pane';

/**
 * Each template example marks the content it renders with `data-testid`, so the tests can tell
 * the consumer's template from the default rendering.
 */
async function openExample(page: Page, demo: string): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PAGE);
  const field = page.locator(`app-multi-select-${demo}-demo med-multi-select [role="combobox"]`).first();
  await field.scrollIntoViewIfNeeded({ timeout: 5_000 });
  await field.click();
  return field;
}

test.describe('MultiSelect docs page — template examples', () => {
  // SITE-025.S3 (value)
  test('SITE-025.S3: the value template example renders the consumer content in the field once an option is picked', async ({ page }) => {
    const field = await openExample(page, 'template-value');
    await page.locator(`${PANEL} [role="option"]`).first().click();
    await expect(field.locator('[data-testid="value-template"]')).toBeVisible({ timeout: 5_000 });
  });

  // SITE-025.S3 (option)
  test('SITE-025.S3: the option template example renders the consumer content in the panel rows', async ({ page }) => {
    await openExample(page, 'template-option');
    await expect(page.locator(`${PANEL} [role="option"] [data-testid="option-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-025.S3 (group)
  test('SITE-025.S3: the group template example renders the consumer content in the group headers', async ({ page }) => {
    await openExample(page, 'template-group');
    await expect(page.locator(`${PANEL} [data-testid="group-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-025.S3 (chip)
  test('SITE-025.S3: the chip template example renders the consumer content in each chip once an option is picked', async ({ page }) => {
    const field = await openExample(page, 'template-chip');
    await page.locator(`${PANEL} [role="option"]`).first().click();
    await expect(field.locator('[data-testid="chip-template"]').first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-025.S3 (header and footer)
  test('SITE-025.S3: the header and footer example renders both consumer blocks in the panel', async ({ page }) => {
    await openExample(page, 'template-header-footer');
    await expect(page.locator(`${PANEL} [data-testid="header-template"]`).first()).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(`${PANEL} [data-testid="footer-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-025.S3 (empty)
  test('SITE-025.S3: the empty example renders the consumer content once the filter matches nothing', async ({ page }) => {
    await openExample(page, 'template-empty');
    await page.locator(`${PANEL} input`).first().fill('zzzzzz-no-match');
    await expect(page.locator(`${PANEL} [data-testid="empty-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-025.S3 (icons)
  test('SITE-025.S3: the icon example renders the consumer open icon and, once an option is picked, the clear icon', async ({ page }) => {
    const field = await openExample(page, 'template-icons');
    const host = page.locator('app-multi-select-template-icons-demo med-multi-select').first();
    await expect(host.locator('[data-testid="trigger-icon-template"]')).toBeVisible({ timeout: 5_000 });
    await page.locator(`${PANEL} [role="option"]`).first().click();
    await expect(field).toBeVisible();
    await expect(host.locator('[data-testid="clear-icon-template"]')).toBeVisible({ timeout: 5_000 });
  });
});
