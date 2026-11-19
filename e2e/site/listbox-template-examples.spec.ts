import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE = '/docs/components/listbox';

/**
 * Each template example marks the content it renders with `data-testid`, so the tests can tell
 * the consumer's template from the default rendering. The Listbox is inline, so the list sits
 * inside the example instead of an overlay.
 */
async function openExample(page: Page, demo: string): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PAGE);
  const host = page.locator(`app-listbox-${demo}-demo med-listbox`).first();
  await host.scrollIntoViewIfNeeded({ timeout: 5_000 });
  return host;
}

test.describe('Listbox docs page — template examples', () => {
  // SITE-026.S3 (option)
  test('SITE-026.S3: the option template example renders the consumer content in the list rows', async ({ page }) => {
    const host = await openExample(page, 'template-option');
    await expect(host.locator('[role="option"] [data-testid="option-template"]').first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-026.S3 (group)
  test('SITE-026.S3: the group template example renders the consumer content in the group headers', async ({ page }) => {
    const host = await openExample(page, 'template-group');
    await expect(host.locator('[data-testid="group-template"]').first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-026.S3 (header and footer)
  test('SITE-026.S3: the header and footer example renders both consumer blocks in the list', async ({ page }) => {
    const host = await openExample(page, 'template-header-footer');
    await expect(host.locator('[data-testid="header-template"]').first()).toBeVisible({ timeout: 5_000 });
    await expect(host.locator('[data-testid="footer-template"]').first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-026.S3 (empty)
  test('SITE-026.S3: the empty example renders the consumer content once the filter matches nothing', async ({ page }) => {
    const host = await openExample(page, 'template-empty');
    await host.locator('input').first().fill('zzzzzz-no-match');
    await expect(host.locator('[data-testid="empty-template"]').first()).toBeVisible({ timeout: 5_000 });
  });
});
