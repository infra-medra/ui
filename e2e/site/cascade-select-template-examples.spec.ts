import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE = '/docs/components/cascade-select';
const PANEL = '.cdk-overlay-pane';

/**
 * Each template example marks the content it renders with `data-testid`, so the tests can tell
 * the consumer's template from the default rendering.
 */
async function openExample(page: Page, demo: string): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PAGE);
  const field = page.locator(`app-cascade-select-${demo}-demo med-cascade-select [role="combobox"]`).first();
  await field.scrollIntoViewIfNeeded({ timeout: 5_000 });
  await field.click();
  return field;
}

/** Walks down the first branch of every level; the last click picks a leaf and closes the panel. */
async function pickFirstLeaf(page: Page): Promise<void> {
  for (let level = 0; level < 6 && (await page.locator(PANEL).count()) > 0; level++) {
    await page.locator(PANEL).last().locator('[role="option"]').first().click();
  }
}

test.describe('CascadeSelect docs page — template examples', () => {
  // SITE-023.S3 (value)
  test('SITE-023.S3: the value template example renders the consumer content in the field once a leaf is picked', async ({ page }) => {
    const field = await openExample(page, 'template-value');
    await pickFirstLeaf(page);
    await expect(field.locator('[data-testid="value-template"]')).toBeVisible({ timeout: 5_000 });
  });

  // SITE-023.S3 (option)
  test('SITE-023.S3: the option template example renders the consumer content in the panel rows', async ({ page }) => {
    await openExample(page, 'template-option');
    await expect(page.locator(`${PANEL} [role="option"] [data-testid="option-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-023.S3 (header and footer)
  test('SITE-023.S3: the header and footer example renders both consumer blocks in the panel', async ({ page }) => {
    await openExample(page, 'template-header-footer');
    await expect(page.locator(`${PANEL} [data-testid="header-template"]`).first()).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(`${PANEL} [data-testid="footer-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-023.S3 (icons)
  test('SITE-023.S3: the icon example renders the consumer open icon in the field and the group icon in the panel', async ({ page }) => {
    const field = await openExample(page, 'template-icons');
    await expect(field.locator('[data-testid="trigger-icon-template"]')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(`${PANEL} [data-testid="group-icon-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });
});
