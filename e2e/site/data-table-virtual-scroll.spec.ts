import { expect, Locator, Page, test } from '@playwright/test';

const PAGE = '/docs/components/data-table';

const VIRTUAL_DEMO = 'app-data-table-virtual-scroll-demo';
const VIRTUAL_TABLE = `${VIRTUAL_DEMO} > med-data-table`;
const LAZY_DEMO = 'app-data-table-lazy-virtual-scroll-demo';
const ROW_HEIGHT = 40;

const VIRTUAL_EXAMPLES = [
  { id: 'example-virtual-scroll', selector: VIRTUAL_DEMO },
  { id: 'example-lazy-virtual-scroll', selector: LAZY_DEMO },
] as const;

/** The scroll viewport of the table inside a demo. */
function viewport(page: Page, demo: string): Locator {
  return page.locator(`${demo} [data-med-scroll-viewport]`);
}

async function scrollTo(page: Page, demo: string, top: number): Promise<void> {
  await viewport(page, demo).evaluate((element, value) => {
    element.scrollTop = value;
  }, top);
}

async function openPage(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PAGE);
}

test.describe('DataTable virtual scroll', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page);
    await page.locator(VIRTUAL_DEMO).scrollIntoViewIfNeeded();
  });

  // DAT-046.S1
  test('DAT-046.S1: renders only the window and sizes the scrollable area to every row', async ({ page }) => {
    await expect(page.locator(`${VIRTUAL_TABLE} tbody tr[aria-rowindex]`).first()).toBeVisible();

    const bodyRows = await page.locator(`${VIRTUAL_TABLE} tbody tr[aria-rowindex]`).count();
    expect(bodyRows).toBeGreaterThan(0);
    expect(bodyRows).toBeLessThan(100);

    // 10,000 rows of 40 pixels, plus the sticky header and the one frozen row: a row that renders taller than its item size shows up here.
    const scrollHeight = await viewport(page, VIRTUAL_TABLE).evaluate((element) => element.scrollHeight);
    expect(scrollHeight).toBeGreaterThanOrEqual(10000 * ROW_HEIGHT);
    expect(scrollHeight).toBeLessThanOrEqual(10000 * ROW_HEIGHT + 200);
  });

  // DAT-046.S2
  test('DAT-046.S2: scrolling renders the rows in view and drops the rows left behind', async ({ page }) => {
    await expect(page.locator(`${VIRTUAL_TABLE} td:text-is("Row 0")`)).toHaveCount(1);

    await scrollTo(page, VIRTUAL_TABLE, 200000);

    const row = page.locator(`${VIRTUAL_TABLE} td:text-is("Row 5000")`);
    await expect(row).toHaveCount(1);
    const inside = await page.evaluate(
      ({ demo }) => {
        const port = document.querySelector(`${demo} [data-med-scroll-viewport]`)!.getBoundingClientRect();
        const cell = Array.from(document.querySelectorAll(`${demo} td`)).find((td) => td.textContent?.trim() === 'Row 5000')!.getBoundingClientRect();
        return cell.top >= port.top && cell.bottom <= port.bottom;
      },
      { demo: VIRTUAL_TABLE },
    );
    expect(inside).toBe(true);
    await expect(page.locator(`${VIRTUAL_TABLE} td:text-is("Row 0")`)).toHaveCount(0);
  });

  // DAT-046.S6
  test('DAT-046.S6: the header and the frozen row stay in view while the body scrolls', async ({ page }) => {
    await scrollTo(page, VIRTUAL_TABLE, 200000);
    await expect(page.locator(`${VIRTUAL_TABLE} td:text-is("Row 5000")`)).toHaveCount(1);

    const positions = await page.evaluate(
      ({ demo }) => {
        const port = document.querySelector(`${demo} [data-med-scroll-viewport]`)!.getBoundingClientRect();
        const header = document.querySelector(`${demo} thead th`)!.getBoundingClientRect();
        const frozen = Array.from(document.querySelectorAll(`${demo} tbody tr`)).find((tr) => tr.textContent?.includes('Pinned'))!.getBoundingClientRect();
        return { portTop: port.top, headerTop: header.top, headerBottom: header.bottom, frozenTop: frozen.top, frozenBottom: frozen.bottom, portBottom: port.bottom };
      },
      { demo: VIRTUAL_TABLE },
    );
    expect(Math.abs(positions.headerTop - positions.portTop)).toBeLessThanOrEqual(1);
    expect(positions.frozenTop).toBeGreaterThanOrEqual(positions.headerBottom - 1);
    expect(positions.frozenBottom).toBeLessThanOrEqual(positions.portBottom);
  });

  // DAT-046.S7
  test('DAT-046.S7: without scrollHeight the viewport is 400 pixels tall and still renders only a window', async ({ page }) => {
    const height = await viewport(page, VIRTUAL_TABLE).evaluate((element) => element.getBoundingClientRect().height);
    expect(Math.round(height)).toBe(400);
    expect(await page.locator(`${VIRTUAL_TABLE} tbody tr[aria-rowindex]`).count()).toBeLessThan(100);
  });

  // DAT-047.S1
  test('DAT-047.S1: ArrowDown past the rendered window scrolls the next row into view and focuses it', async ({ page }) => {
    await page.locator(`${VIRTUAL_TABLE} td:text-is("Row 0")`).click();
    await expect(page.locator(`${VIRTUAL_TABLE} tr[aria-selected="true"]`)).toHaveCount(1);

    // More presses than the viewport has rows, so the focused row has to leave the first screen.
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('ArrowDown');
    }

    // Header row 1, frozen row 2, then body index 14 at position 17.
    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('aria-rowindex'))).toBe('17');
    expect(await viewport(page, VIRTUAL_TABLE).evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(page.locator(`${VIRTUAL_TABLE} tr:focus`)).toBeInViewport();
  });

  // DAT-047.S2
  test('DAT-047.S2: End reaches the last row of the whole set', async ({ page }) => {
    await page.locator(`${VIRTUAL_TABLE} td:text-is("Row 0")`).click();
    await page.keyboard.press('End');

    await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute('aria-rowindex'))).toBe('10002');
    await expect(page.locator(`${VIRTUAL_TABLE} tr:focus`)).toContainText('Row 9999');
  });
});

test.describe('DataTable lazy virtual scroll', () => {
  test.beforeEach(async ({ page }) => {
    await openPage(page);
    await page.locator(LAZY_DEMO).scrollIntoViewIfNeeded();
  });

  const requestedBlocks = async (page: Page): Promise<number[]> => {
    const text = (await page.locator(`${LAZY_DEMO} [data-testid="lazy-requests"]`).textContent()) ?? '';
    return (text.match(/\d+/g) ?? []).map(Number);
  };

  // DAT-048.S2
  test('DAT-048.S2: requests the block in view once, however often it is scrolled over', async ({ page }) => {
    await expect.poll(() => requestedBlocks(page)).toEqual(expect.arrayContaining([0, 50]));

    for (const top of [50000 * ROW_HEIGHT, 49990 * ROW_HEIGHT, 50000 * ROW_HEIGHT, 49990 * ROW_HEIGHT, 50000 * ROW_HEIGHT]) {
      await scrollTo(page, LAZY_DEMO, top);
      await page.waitForTimeout(50);
    }

    await expect.poll(async () => (await requestedBlocks(page)).filter((first) => first === 50000).length).toBe(1);
    // The demo answers each request after a short delay: the placeholders give way to the rows.
    await expect(page.locator(`${LAZY_DEMO} td:text-is("Row 50000")`)).toHaveCount(1);
    await page.waitForTimeout(400);
    expect((await requestedBlocks(page)).filter((first) => first === 50000).length).toBe(1);
  });
});

test.describe('DataTable virtual scroll docs', () => {
  // DAT-024.S14
  test('DAT-024.S14: virtual scroll and lazy virtual scroll each have an index entry, prose, a demo and a code block', async ({ page }) => {
    await openPage(page);
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
        return {
          id,
          inToc: tocIds.includes(id),
          found: true,
          proseLength: Math.max(0, ...prose.map((text) => text.length)),
          demos: fragment.querySelectorAll(selector).length,
          codeBlocks: fragment.querySelectorAll('app-code-block pre code').length,
        };
      });
    }, [...VIRTUAL_EXAMPLES]);

    for (const entry of report) {
      expect(entry.inToc, `missing TOC entry for "${entry.id}"`).toBe(true);
      expect(entry.found, `missing section for "${entry.id}"`).toBe(true);
      expect(entry.proseLength, `missing prose for "${entry.id}"`).toBeGreaterThan(0);
      expect(entry.demos, `missing demo for "${entry.id}"`).toBe(1);
      expect(entry.codeBlocks, `missing code block for "${entry.id}"`).toBeGreaterThanOrEqual(1);
    }

    // The virtual scroll demo holds at least 10,000 rows while it renders fewer than 100 body rows.
    const table = page.locator(`${VIRTUAL_TABLE} table`);
    const rowCount = Number(await table.getAttribute('aria-rowcount'));
    expect(rowCount).toBeGreaterThanOrEqual(10000);
    expect(await page.locator(`${VIRTUAL_TABLE} tbody tr[aria-rowindex]`).count()).toBeLessThan(100);
  });
});
