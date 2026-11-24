import { expect, Page, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';
const DEMO = '[data-med-virtual-variable-height-demo]';
const ITEM_SIZE = 40;
const ROW_COUNT = 60;

async function openDemo(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PAGE);
  const demo = page.locator(DEMO);
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.locator('tbody tr[aria-rowindex]:not([data-med-placeholder])').first()).toBeVisible();
}

test.describe('DataTable virtual scroll variable height', () => {
  // DAT-061.S2
  test('DAT-061.S2: renders rows at natural heights without truncation and grows scrollHeight as ResizeObserver measures wrapped rows', async ({
    page,
  }) => {
    await openDemo(page);

    const viewport = page.locator(`${DEMO} [data-med-scroll-viewport]`);
    const viewportHeight = await viewport.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(viewportHeight)).toBe(200);

    // Wait for initial ResizeObserver measurements to settle on the visible rows.
    await expect
      .poll(async () => {
        return page.locator(DEMO).evaluate((root) => {
          const rows = Array.from(root.querySelectorAll<HTMLElement>('tbody tr[aria-rowindex]:not([data-med-placeholder])'));
          const heights = rows.map((tr) => tr.getBoundingClientRect().height);
          return Math.max(0, ...heights);
        });
      })
      .toBeGreaterThan(ITEM_SIZE);

    const initialMetrics = await page.locator(DEMO).evaluate((root) => {
      const vp = root.querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
      const headerHeight = root.querySelector<HTMLElement>('thead')?.getBoundingClientRect().height ?? 0;
      const rows = Array.from(root.querySelectorAll<HTMLElement>('tbody tr[aria-rowindex]:not([data-med-placeholder])'));
      const rowHeights = rows.map((tr) => Math.round(tr.getBoundingClientRect().height));
      const cells = Array.from(root.querySelectorAll<HTMLElement>('tbody tr[aria-rowindex]:not([data-med-placeholder]) td'));
      const cellStyles = cells.map((td) => {
        const style = getComputedStyle(td);
        return {
          textOverflow: style.textOverflow,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          scrollWidth: td.scrollWidth,
          clientWidth: td.clientWidth,
        };
      });
      return {
        scrollHeight: vp.scrollHeight,
        headerHeight,
        rowHeights,
        cellStyles,
      };
    });

    // Body rows render at varying natural heights without fixed height or truncation.
    expect(new Set(initialMetrics.rowHeights).size).toBeGreaterThan(1);
    expect(Math.max(...initialMetrics.rowHeights)).toBeGreaterThan(ITEM_SIZE);
    for (const cell of initialMetrics.cellStyles) {
      expect(cell.textOverflow).not.toBe('ellipsis');
      expect(cell.overflowX).not.toBe('hidden');
      expect(cell.overflowY).not.toBe('hidden');
      expect(cell.scrollWidth).toBeLessThanOrEqual(cell.clientWidth + 1);
    }

    const initialScrollHeight = initialMetrics.scrollHeight;
    const estimatedTotalHeight = ROW_COUNT * ITEM_SIZE + initialMetrics.headerHeight;
    expect(initialScrollHeight).toBeGreaterThan(estimatedTotalHeight);

    // Scroll down so previously unmeasured rows enter the viewport and are measured by ResizeObserver.
    await viewport.evaluate((el) => {
      el.scrollTop = 900;
    });

    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollHeight))
      .toBeGreaterThan(initialScrollHeight);

    const afterFirstScroll = await viewport.evaluate((el) => el.scrollHeight);
    await viewport.evaluate((el) => {
      el.scrollTop = 1800;
    });

    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollHeight))
      .toBeGreaterThan(afterFirstScroll);
  });
});
