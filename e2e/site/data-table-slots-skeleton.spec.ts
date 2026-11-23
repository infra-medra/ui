import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';

const SLOTS_AND_SKELETON_EXAMPLES = [
  { id: 'example-caption-summary', selector: 'app-data-table-caption-summary-demo' },
  { id: 'example-empty-template', selector: 'app-data-table-empty-template-demo' },
  { id: 'example-loading-skeleton', selector: 'app-data-table-loading-skeleton-demo' },
] as const;

test.describe('DataTable slots, custom empty template and skeleton loading docs', () => {
  // DAT-024.S12
  test('DAT-024.S12: caption/summary slots, custom empty template and skeleton loading each have an index entry, prose, a demo and a code block', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PAGE);
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc).toBeVisible();

    const report = await page.evaluate((examples) => {
      const nav = document.querySelector('nav[aria-label="On this page"]')!;
      const tocIds = Array.from(nav.querySelectorAll('ul ul a')).map((a) => (a.getAttribute('href') ?? '').split('#')[1] ?? '');
      const anchors = Array.from(document.querySelectorAll<HTMLElement>('article [id^="example-"]'));
      const end = document.getElementById('api-reference');

      return examples.map(({ id, selector }) => {
        const index = anchors.findIndex((el) => el.id === id);
        if (index === -1) {
          return { id, inToc: tocIds.includes(id), found: false, proseLength: 0, demos: 0, codeBlocks: 0 };
        }
        const anchor = anchors[index];
        const range = document.createRange();
        range.setStartBefore(anchor);
        const next = anchors[index + 1] ?? end;
        if (next) range.setEndBefore(next);
        else range.setEndAfter(anchor);
        const fragment = range.cloneContents();
        const prose = Array.from(fragment.querySelectorAll('app-prose')).map((el) => (el.textContent ?? '').trim());
        const proseLength = Math.max(0, ...prose.map((text) => text.length));
        return {
          id,
          inToc: tocIds.includes(id),
          found: true,
          proseLength,
          demos: fragment.querySelectorAll(selector).length,
          codeBlocks: fragment.querySelectorAll('app-code-block pre code').length,
        };
      });
    }, [...SLOTS_AND_SKELETON_EXAMPLES]);

    for (const entry of report) {
      expect(entry.inToc, `missing TOC entry for "${entry.id}"`).toBe(true);
      expect(entry.found, `missing section for "${entry.id}"`).toBe(true);
      expect(entry.proseLength, `missing prose for "${entry.id}"`).toBeGreaterThan(0);
      expect(entry.demos, `missing demo for "${entry.id}"`).toBe(1);
      expect(entry.codeBlocks, `missing code block for "${entry.id}"`).toBeGreaterThanOrEqual(1);
    }
  });

  // DAT-024.S12, DAT-040.S1
  test('DAT-024.S12: the caption-summary demo renders caption above the header and summary below the table before the paginator', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-caption-summary-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const caption = demo.locator('[data-med-caption]');
    const thead = demo.locator('thead');
    const table = demo.locator('table');
    const summary = demo.locator('[data-med-summary]');
    const paginator = demo.locator('med-paginator');

    await expect(caption).toBeVisible();
    await expect(summary).toBeVisible();
    await expect(paginator).toBeVisible();

    const captionBox = await caption.boundingBox();
    const theadBox = await thead.boundingBox();
    const tableBox = await table.boundingBox();
    const summaryBox = await summary.boundingBox();
    const paginatorBox = await paginator.boundingBox();

    expect(captionBox!.y + captionBox!.height).toBeLessThanOrEqual(theadBox!.y + 1);
    expect(tableBox!.y + tableBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
    expect(summaryBox!.y + summaryBox!.height).toBeLessThanOrEqual(paginatorBox!.y + 1);
  });

  // DAT-024.S12, DAT-041.S1
  test('DAT-024.S12: the empty-template demo renders the custom empty template instead of the default label', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-empty-template-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const emptyCell = demo.locator('tbody tr td').first();
    await expect(emptyCell).toBeVisible();
    await expect(emptyCell).toHaveAttribute('colspan', '3');
    await expect(emptyCell).not.toContainText('No results found');
    await expect(emptyCell).toContainText('No equipment');
  });

  // DAT-024.S12, DAT-042.S1, DAT-042.S2
  test('DAT-024.S12: the loading-skeleton demo shows skeleton rows while loading and restores data rows when stopped', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-loading-skeleton-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const table = demo.locator('table');
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(demo.locator('med-progress-spinner')).toHaveCount(0);
    await expect(demo.locator('tbody tr')).toHaveCount(5);
    await expect(demo.locator('tbody med-skeleton')).toHaveCount(15);

    await demo.getByRole('button', { name: 'Stop loading' }).click();

    await expect(table).not.toHaveAttribute('aria-busy', 'true');
    await expect(demo.locator('tbody med-skeleton')).toHaveCount(0);
    await expect(demo.locator('tbody tr').first()).toContainText('Oscilloscope');
  });
});
