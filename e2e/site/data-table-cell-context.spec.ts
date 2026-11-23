import { expect, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';

const CELL_CONTEXT_EXAMPLES = [
  { id: 'example-cell-selection', selector: 'app-data-table-cell-selection-demo' },
  { id: 'example-cell-class', selector: 'app-data-table-cell-class-demo' },
  { id: 'example-context-menu', selector: 'app-data-table-context-menu-demo' },
] as const;

test.describe('DataTable cell selection, conditional cell style and context menu docs', () => {
  // DAT-024.S13
  test('DAT-024.S13: cell selection, conditional cell style and context menu each have an index entry, prose, a demo and a code block', async ({
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
    }, [...CELL_CONTEXT_EXAMPLES]);

    for (const entry of report) {
      expect(entry.inToc, `missing TOC entry for "${entry.id}"`).toBe(true);
      expect(entry.found, `missing section for "${entry.id}"`).toBe(true);
      expect(entry.proseLength, `missing prose for "${entry.id}"`).toBeGreaterThan(0);
      expect(entry.demos, `missing demo for "${entry.id}"`).toBe(1);
      expect(entry.codeBlocks, `missing code block for "${entry.id}"`).toBeGreaterThanOrEqual(1);
    }
  });

  // DAT-024.S13, DAT-043.S1
  test('DAT-024.S13: the cell-selection demo selects individual cells without selecting whole rows', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-cell-selection-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const firstRow = demo.locator('tbody tr').first();
    await expect(firstRow).not.toHaveAttribute('aria-selected', /.+/);

    const firstCell = firstRow.locator('td').first();
    const secondCell = firstRow.locator('td').nth(1);
    const secondRowSecondCell = demo.locator('tbody tr').nth(1).locator('td').nth(1);

    await firstCell.click();
    await expect(firstCell).toHaveAttribute('aria-selected', 'true');
    await expect(secondCell).toHaveAttribute('aria-selected', 'false');

    await secondRowSecondCell.click();
    await expect(firstCell).toHaveAttribute('aria-selected', 'false');
    await expect(secondRowSecondCell).toHaveAttribute('aria-selected', 'true');
  });

  // DAT-024.S13, DAT-044.S1
  test('DAT-024.S13: the cell-class demo styles matching body cells differently from normal cells', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-cell-class-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const normalCell = demo.locator('tbody tr').first().locator('td').last();
    const outOfStockCell = demo.locator('tbody tr', { hasText: 'Multimeter' }).locator('td').last();

    await expect(normalCell).toBeVisible();
    await expect(outOfStockCell).toBeVisible();

    const normalBg = await normalCell.evaluate((el) => getComputedStyle(el).backgroundColor);
    const highlightedBg = await outOfStockCell.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(highlightedBg).not.toBe(normalBg);
  });

  // DAT-024.S13, DAT-045.S1, DAT-045.S2
  test('DAT-024.S13: the context-menu demo opens its menu on right-click and Shift+F10', async ({ page }) => {
    await page.goto(PAGE);
    const demo = page.locator('app-data-table-context-menu-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    const secondRow = demo.locator('tbody tr').nth(1);
    await secondRow.locator('td').first().click({ button: 'right' });

    const menu = page.locator('[role="menu"]');
    await expect(menu).toBeVisible();
    await menu.getByRole('menuitem', { name: 'Inspect' }).click();
    await expect(menu).toBeHidden();
    await expect(demo).toContainText('Inspect');
    await expect(demo).toContainText('Soldering station');

    const firstRow = demo.locator('tbody tr').first();
    await firstRow.focus();
    await page.keyboard.press('Shift+F10');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });
});
