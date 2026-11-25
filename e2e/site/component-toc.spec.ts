import { expect, test, type Page } from '@playwright/test';

const AUTOCOMPLETE_URL = '/docs/components/autocomplete';
/** A component page that lists no examples, so its index holds only the four fixed parts. */
const NO_EXAMPLES_URL = '/docs/components/knob';
const FIXED_PARTS = ['Examples', 'API reference', 'Accessibility', 'Theming'];
/** The examples the AutoComplete page lists in "On this page", in page order, with their anchor ids. */
const EXAMPLES: readonly { label: string; id: string }[] = [
  { label: 'Basic', id: 'example-basic' },
  { label: 'Multiple', id: 'example-multiple' },
  { label: 'Grouped with dropdown', id: 'example-grouped-dropdown' },
  { label: 'Force selection', id: 'example-force-selection' },
  { label: 'Complete on focus', id: 'example-complete-on-focus' },
  { label: 'Events', id: 'example-events' },
  { label: 'Auto highlight', id: 'example-auto-highlight' },
  { label: 'Unique', id: 'example-unique' },
  { label: 'Read-only', id: 'example-readonly' },
  { label: 'Item template', id: 'example-item-template' },
  { label: 'Group template', id: 'example-group-template' },
  { label: 'Empty template', id: 'example-empty-template' },
  { label: 'Loader template', id: 'example-loader-template' },
  { label: 'States', id: 'example-states' },
  { label: 'Sizes', id: 'example-sizes' },
  { label: 'Scroll height', id: 'example-scroll-height' },
  { label: 'Virtual scroll', id: 'example-virtual-scroll' },
];

async function openPage(page: Page, url: string) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url);
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc).toBeVisible();
  return toc;
}

test.describe('Component page — "On this page" index', () => {
  // SITE-021.S1
  test('SITE-021.S1: clicking an index item scrolls to its section without leaving the page', async ({ page }) => {
    const toc = await openPage(page, AUTOCOMPLETE_URL);

    await toc.getByRole('link', { name: 'API reference' }).click();

    await expect(page).toHaveURL(new RegExp(`${AUTOCOMPLETE_URL}#api-reference$`));
    await expect(page.getByRole('heading', { level: 2, name: 'API reference' })).toBeInViewport({ timeout: 5_000 });
  });

  // SITE-021.S2
  test('SITE-021.S2: lists every example nested under Examples and each item leads to its example', async ({ page }) => {
    const toc = await openPage(page, AUTOCOMPLETE_URL);

    const parent = await toc.getByRole('link', { name: 'Examples', exact: true }).boundingBox();
    expect(parent, 'the Examples item is missing').not.toBeNull();
    for (const example of EXAMPLES) {
      const link = toc.getByRole('link', { name: example.label, exact: true });
      await expect(link, `"${example.label}" is missing from the index`).toHaveCount(1);
      const box = await link.boundingBox();
      expect(box!.x > parent!.x, `"${example.label}" is not indented below Examples`).toBe(true);
    }

    await toc.getByRole('link', { name: 'Events', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${AUTOCOMPLETE_URL}#example-events$`));
    await expect(page.locator('#example-events')).toBeInViewport({ timeout: 5_000 });
  });

  // SITE-021.S3
  test('SITE-021.S3: marks the example being read as current', async ({ page }) => {
    const toc = await openPage(page, AUTOCOMPLETE_URL);

    await page.locator('#example-readonly').scrollIntoViewIfNeeded();

    await expect(toc.getByRole('link', { name: 'Read-only', exact: true })).toHaveAttribute('aria-current', 'true');
    await expect(toc.getByRole('link', { name: 'Basic', exact: true })).not.toHaveAttribute('aria-current', 'true');
  });

  // SITE-021.S4
  test('SITE-021.S4: a page that lists no examples keeps the four fixed parts', async ({ page }) => {
    const toc = await openPage(page, NO_EXAMPLES_URL);

    const labels = await toc.getByRole('link').allTextContents();
    expect(labels.map((label) => label.trim())).toEqual(FIXED_PARTS);
  });
});
