import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const PAGE = '/docs/components/autocomplete';
const PANEL = '.cdk-overlay-pane';
const GROUPED_DEMO_SOURCE = 'projects/site/src/app/pages/docs/components/demos/autocomplete-grouped-dropdown.demo.ts';

/**
 * Each template example marks the content it renders with `data-testid`, so the tests can tell
 * the consumer's template from the default rendering.
 */
async function openExample(page: Page, demo: string, typed: string): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PAGE);
  const input = page.locator(`app-autocomplete-${demo}-demo med-autocomplete input`).first();
  await input.scrollIntoViewIfNeeded({ timeout: 5_000 });
  await input.click();
  await page.keyboard.type(typed);
}

test.describe('AutoComplete docs page — grouping model and template examples', () => {
  // SITE-020.S4
  test('SITE-020.S4: the grouped example explains that each option carries its group in `group` and that a group stays together', async ({ page }) => {
    await page.goto(PAGE);
    const text = (await page.locator('#example-grouped-dropdown').innerText()).replace(/\s+/g, ' ');

    expect(/\bgroup\b/.test(text) && /each (option|suggestion)/i.test(text), 'the text does not say each option carries its group in `group`').toBe(true);
    expect(/(same|one) group[^.]*(together|adjacent|consecutive|contiguous)/i.test(text), 'the text does not say same-group options stay together').toBe(true);

    const source = readFileSync(GROUPED_DEMO_SOURCE, 'utf8');
    const groups = new Set([...source.matchAll(/group:\s*'([^']+)'/g)].map((match) => match[1]));
    expect(groups.size > 1, 'the example code fills `group` for fewer than two groups').toBe(true);
    expect(/SelectOption\.group/.test(source), 'the example code has no comment about `SelectOption.group`').toBe(true);
  });

  // SITE-020.S5 (item)
  test('SITE-020.S5: the item template example renders the consumer item content in the panel', async ({ page }) => {
    await openExample(page, 'item-template', 'a');
    await expect(page.locator(`${PANEL} [role=option] [data-testid="item-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-020.S5 (group)
  test('SITE-020.S5: the group template example renders the consumer group header in the panel', async ({ page }) => {
    await openExample(page, 'group-template', 'a');
    await expect(page.locator(`${PANEL} [data-testid="group-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-020.S5 (empty)
  test('SITE-020.S5: the empty template example renders the consumer empty state when nothing matches', async ({ page }) => {
    await openExample(page, 'empty-template', 'zzzzzz');
    await expect(page.locator(`${PANEL} [data-testid="empty-template"]`).first()).toBeVisible({ timeout: 5_000 });
  });

  // SITE-020.S5 (loader)
  test('SITE-020.S5: the loader template example shows the consumer loader while loading, then the list', async ({ page }) => {
    await openExample(page, 'loader-template', 'a');
    await expect(page.locator(`${PANEL} [data-testid="loader-template"]`).first()).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(`${PANEL} [role=option]`).first()).toBeVisible({ timeout: 5_000 });
  });
});
