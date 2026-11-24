import { expect, Page, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';
const DEMO = '[data-med-virtual-columns-demo]';

async function openDemo(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PAGE);
  const demo = page.locator(DEMO);
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.locator('tbody tr[aria-rowindex] td[data-med-field="item"]').first()).toBeVisible();
}

test.describe('DataTable virtual horizontal columns', () => {
  // DAT-063.S2
  test('DAT-063.S2: keeps left-frozen column pinned while middle columns render and off-screen columns unmount on horizontal scroll', async ({
    page,
  }) => {
    await openDemo(page);

    const table = page.locator(`${DEMO} table`);
    const viewport = page.locator(`${DEMO} [data-med-scroll-viewport]`);

    await expect(table).toHaveAttribute('aria-colcount', '41');
    const viewportHeight = await viewport.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(viewportHeight)).toBe(200);

    // Initially early columns render and far-right off-screen columns are omitted.
    await expect(page.locator(`${DEMO} tbody td[data-med-field="c0"]`).first()).toBeVisible();
    await expect(page.locator(`${DEMO} tbody td[data-med-field="c39"]`)).toHaveCount(0);
    const initialHeaderCols = await page.locator(`${DEMO} tr[data-med-header-row] th`).count();
    expect(initialHeaderCols).toBeLessThan(25);

    // Scroll horizontally to the middle of the table.
    const middleScrollLeft = await viewport.evaluate((el) => {
      const target = Math.floor((el.scrollWidth - el.clientWidth) / 2);
      el.scrollLeft = target;
      return target;
    });
    expect(middleScrollLeft).toBeGreaterThan(1000);

    // Wait for scroll handler to update the horizontal column window.
    await expect(page.locator(`${DEMO} tbody td[data-med-field="c0"]`)).toHaveCount(0);
    await expect(page.locator(`${DEMO} tbody td[data-med-field="c39"]`)).toHaveCount(0);

    // Verify left-frozen column stays pinned on the left edge and a middle column is visible inside the viewport.
    const metrics = await page.locator(DEMO).evaluate(() => {
      const vp = document.querySelector<HTMLElement>('[data-med-virtual-columns-demo] [data-med-scroll-viewport]')!;
      const vpRect = vp.getBoundingClientRect();
      const frozenHeader = vp.querySelector<HTMLElement>('tr[data-med-header-row] th[aria-colindex="1"]')!;
      const frozenCell = vp.querySelector<HTMLElement>('tbody tr[aria-rowindex] td[data-med-field="item"]')!;
      const frozenHeaderRect = frozenHeader.getBoundingClientRect();
      const frozenCellRect = frozenCell.getBoundingClientRect();

      const bodyCells = Array.from(vp.querySelectorAll<HTMLElement>('tbody tr[aria-rowindex]:first-of-type td[data-med-field]'));
      const visibleMiddle = bodyCells.filter((td) => {
        const field = td.getAttribute('data-med-field') ?? '';
        if (!field.startsWith('c')) {
          return false;
        }
        const idx = Number(field.slice(1));
        if (idx < 10 || idx > 30) {
          return false;
        }
        const rect = td.getBoundingClientRect();
        return rect.right > frozenCellRect.right && rect.left < vpRect.right;
      });

      return {
        vpLeft: vpRect.left,
        frozenHeaderLeft: frozenHeaderRect.left,
        frozenCellLeft: frozenCellRect.left,
        visibleMiddleFields: visibleMiddle.map((td) => td.getAttribute('data-med-field')),
        leftSpacerCount: vp.querySelectorAll('tr[data-med-header-row] th[data-med-col-spacer-left]').length,
        rightSpacerCount: vp.querySelectorAll('tr[data-med-header-row] th[data-med-col-spacer-right]').length,
      };
    });

    expect(Math.abs(metrics.frozenHeaderLeft - metrics.vpLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.frozenCellLeft - metrics.vpLeft)).toBeLessThanOrEqual(1);
    expect(metrics.visibleMiddleFields.length).toBeGreaterThan(0);
    expect(metrics.leftSpacerCount).toBe(1);
    expect(metrics.rightSpacerCount).toBe(1);
  });
});
