import { expect, test, type Locator, type Page } from '@playwright/test';

const LONG_PAGE = '/docs/components/select';
const SHORT_PAGE = '/docs/getting-started/introduction';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('element has no bounding box');
  return box;
}

/** Vertical overlap in px between two boxes; 0 or negative means they do not intersect. */
function verticalOverlap(a: Box, b: Box): number {
  return Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
}

/** The scrollable list of sidebar groups: the part that visibly overflows onto the footer. */
function sidebarList(page: Page): Locator {
  return page.locator('aside nav[aria-label="Sidebar"] > div.overflow-y-auto');
}

test.describe('Site layout: sidebar and footer', () => {
  // SITE-017.S1
  test('SITE-017.S1: no sidebar item overlaps the footer at the end of a long page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(LONG_PAGE);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

    const list = sidebarList(page);
    const footer = page.locator('footer');
    await expect(footer).toBeInViewport();

    const overlap = verticalOverlap(await boxOf(list), await boxOf(footer));
    expect(overlap <= 0, `sidebar overlaps the footer by ${overlap}px`).toBe(true);
  });

  // SITE-017.S2
  test('SITE-017.S2: the sidebar does not extend over the footer on a short page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(SHORT_PAGE);

    const list = sidebarList(page);
    const footer = page.locator('footer');

    const overlap = verticalOverlap(await boxOf(list), await boxOf(footer));
    expect(overlap <= 0, `sidebar overlaps the footer by ${overlap}px`).toBe(true);
  });

  // SITE-017.S3
  test('SITE-017.S3: a sidebar list taller than the window scrolls inside the sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto(LONG_PAGE);

    const sidebar = page.locator('aside').filter({ has: page.getByRole('navigation', { name: 'Sidebar' }) });
    const list = sidebarList(page);
    const header = page.locator('header').first();
    const footer = page.locator('footer');

    const metrics = await list.evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));
    expect(metrics.scrollHeight > metrics.clientHeight, 'the sidebar list has its own scroll area').toBe(true);

    await list.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    expect(await list.evaluate((el) => el.scrollTop), 'the sidebar list scrolled internally').toBeGreaterThan(0);

    const sidebarBox = await boxOf(sidebar);
    const headerBox = await boxOf(header);
    expect(sidebarBox.y >= headerBox.y + headerBox.height - 1, 'sidebar starts below the header').toBe(true);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const overlap = verticalOverlap(await boxOf(list), await boxOf(footer));
    expect(overlap <= 0, `sidebar overlaps the footer by ${overlap}px`).toBe(true);
  });
});

const COMPONENT_PAGE = '/docs/components/button';
const AUTOCOMPLETE_PAGE = '/docs/components/autocomplete';

test.describe('Site layout: fluid width', () => {
  // SITE-016.S1
  test('SITE-016.S1: header, docs layout and footer span the whole window at 2560px', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1200 });
    await page.goto(COMPONENT_PAGE);

    const regions: Record<string, Locator> = {
      header: page.locator('header').first().locator('> div').first(),
      'docs layout': page.locator('app-docs-layout > div').first(),
      footer: page.locator('footer > div').first(),
    };

    for (const [name, region] of Object.entries(regions)) {
      const box = await boxOf(region);
      expect(box.width >= 2559, `${name} is ${Math.round(box.width)}px wide, expected the full 2560px`).toBe(true);
    }
  });

  // SITE-016.S2
  test('SITE-016.S2: sidebar, content and "On this page" stay side by side at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(COMPONENT_PAGE);

    const sidebar = await boxOf(page.getByRole('navigation', { name: 'Sidebar' }));
    const article = await boxOf(page.locator('main article').first());
    const toc = await boxOf(page.getByRole('navigation', { name: 'On this page' }));

    expect(sidebar.x + sidebar.width <= article.x, 'sidebar sits left of the content').toBe(true);
    expect(article.x + article.width <= toc.x, '"On this page" sits right of the content').toBe(true);
  });

  // SITE-016.S3
  for (const url of [AUTOCOMPLETE_PAGE, COMPONENT_PAGE]) {
    test(`SITE-016.S3: running text fills the content column and so does the API table at 2560px (${url})`, async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1200 });
      await page.goto(url);

      const article = await boxOf(page.locator('main article').first());

      // Every running-text paragraph of the column, however deep it is nested, outside tables, examples and demos.
      const narrow = await page.locator('main article').first().evaluate((el, columnWidth) => {
        return Array.from(el.querySelectorAll('p'))
          .filter((p) => !p.closest('table, pre, [data-demo], med-code-block'))
          // Demo components are examples, not running text: they size themselves.
          .filter((p) => !Array.from(el.querySelectorAll('*')).some((node) => node.tagName.endsWith('-DEMO') && node.contains(p)))
          .filter((p) => (p.textContent ?? '').trim().length > 0)
          .map((p) => ({ text: (p.textContent ?? '').trim().slice(0, 30), width: p.getBoundingClientRect().width }))
          .filter((p) => Math.abs(p.width - columnWidth) > 1)
          .map((p) => `"${p.text}" is ${Math.round(p.width)}px of ${Math.round(columnWidth)}px`);
      }, article.width);
      expect(narrow.length === 0, `paragraphs narrower than the column: ${narrow.slice(0, 3).join('; ')}`).toBe(true);

      const table = await boxOf(page.locator('#api-reference table').first());
      // The table wrapper draws a border, so allow a few pixels.
      expect(Math.abs(table.width - article.width) <= 4, `API table is ${Math.round(table.width)}px of a ${Math.round(article.width)}px column`).toBe(true);
    });
  }

  // SITE-016.S4
  for (const width of [320, 768, 1280]) {
    test(`SITE-016.S4: no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(COMPONENT_PAGE);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow <= 0, `page overflows horizontally by ${overflow}px`).toBe(true);
    });
  }
});
