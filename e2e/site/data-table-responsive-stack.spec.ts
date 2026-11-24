import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE = '/docs/components/data-table';
const DEMO = 'app-data-table-responsive-stack-demo';
const NARROW = 400;
const WIDE = 1280;

/** Opens the docs page at `width` and scrolls the responsive stack demo into view. */
async function openDemo(page: Page, width: number): Promise<Locator> {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(PAGE);
  const demo = page.locator(DEMO);
  await expect(demo).toBeAttached();
  await demo.scrollIntoViewIfNeeded();
  return demo;
}

/** The demo's `med-data-table` element, whose `block` class is set only while stacked. */
const tableOf = (demo: Locator): Locator => demo.locator('med-data-table table').first();

/** Computed `display` of an element, read from the live layout. */
const displayOf = (locator: Locator): Promise<string> => locator.evaluate((el) => getComputedStyle(el).display);

/** Stack labels: the `aria-hidden` span that is a direct child of a body cell. */
const labelsOf = (demo: Locator): Locator => demo.locator('tbody td > span[aria-hidden="true"]');

test.describe('DataTable responsive stack', () => {
  // DAT-050.S1
  test('DAT-050.S1: a table with the default scroll layout is not stacked and shows no label at 400px', async ({ page }) => {
    await page.setViewportSize({ width: NARROW, height: 900 });
    await page.goto(PAGE);
    // The basic demo leaves responsiveLayout, breakpoint and stackLabel unset, so it is the default scroll layout.
    const demo = page.locator('app-data-table-basic-demo');
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();

    expect(await displayOf(tableOf(demo))).toBe('table');
    expect(await labelsOf(demo).count()).toBe(0);
    const wrapper = demo.locator('med-data-table [data-med-scroll-viewport]').first();
    expect(await wrapper.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
  });

  // DAT-050.S2
  test('DAT-050.S2: below the breakpoint each row is a block and each labelled cell shows its header at 400px', async ({ page }) => {
    const demo = await openDemo(page, NARROW);

    expect(await displayOf(tableOf(demo))).toBe('block');
    const row = demo.locator('tbody tr').first();
    expect(await displayOf(row)).toBe('block');

    const labels = labelsOf(demo);
    expect(await labels.count(), 'the demo shows labels').toBeGreaterThan(0);
    // The label sits beside its value on the same line: the label starts at the cell's left edge and its value text follows it.
    const label = labels.first();
    const cell = label.locator('xpath=..');
    const labelBox = await label.boundingBox();
    const cellBox = await cell.boundingBox();
    expect(labelBox, 'label is rendered').not.toBeNull();
    expect(cellBox, 'cell is rendered').not.toBeNull();
    expect(Math.abs(labelBox!.x - cellBox!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(labelBox!.y - cellBox!.y)).toBeLessThanOrEqual(cellBox!.height);
    expect(cellBox!.width).toBeGreaterThan(labelBox!.width);
  });

  // DAT-050.S3
  test('DAT-050.S3: at or above the breakpoint the table is not stacked and shows no label', async ({ page }) => {
    // The demo uses the default 960px breakpoint, which is the first width at or above it.
    const demo = await openDemo(page, 960);
    expect(await displayOf(tableOf(demo))).toBe('table');
    expect(await labelsOf(demo).count()).toBe(0);

    await page.setViewportSize({ width: WIDE, height: 900 });
    expect(await displayOf(tableOf(demo))).toBe('table');
    expect(await labelsOf(demo).count()).toBe(0);
  });

  // DAT-050.S4
  test('DAT-050.S4: widening past the breakpoint unstacks the table and narrowing stacks it again, without a reload', async ({ page }) => {
    const demo = await openDemo(page, NARROW);
    expect(await displayOf(tableOf(demo))).toBe('block');
    await page.evaluate(() => {
      (window as unknown as { __noReloadMarker: boolean }).__noReloadMarker = true;
    });

    await page.setViewportSize({ width: WIDE, height: 900 });
    await expect.poll(() => displayOf(tableOf(demo))).toBe('table');
    expect(await labelsOf(demo).count()).toBe(0);

    await page.setViewportSize({ width: 800, height: 900 });
    await expect.poll(() => displayOf(tableOf(demo))).toBe('block');
    expect(await labelsOf(demo).count()).toBeGreaterThan(0);

    expect(await page.evaluate(() => (window as unknown as { __noReloadMarker?: boolean }).__noReloadMarker)).toBe(true);
  });

  // DAT-051.S2
  test('DAT-051.S2: the stacked header row stays in the DOM, is not display none and takes no layout space', async ({ page }) => {
    const demo = await openDemo(page, NARROW);
    const headerRow = demo.locator('thead tr').first();

    await expect(headerRow).toBeAttached();
    expect(await displayOf(headerRow)).not.toBe('none');
    expect(await headerRow.getAttribute('aria-hidden')).toBeNull();
    const box = await headerRow.boundingBox();
    expect(box, 'header row is rendered').not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(1);
    expect(box!.height).toBeLessThanOrEqual(1);
  });

  // DAT-051.S5
  test('DAT-051.S5: stacked rows, separators and labels use the light and dark design tokens', async ({ page }) => {
    const demo = await openDemo(page, NARROW);
    const row = demo.locator('tbody tr').first();
    const label = labelsOf(demo).first();
    const read = () =>
      Promise.all([
        row.evaluate((el) => ({ background: getComputedStyle(el).backgroundColor, border: getComputedStyle(el).borderBottomColor })),
        label.evaluate((el) => getComputedStyle(el).color),
      ]).then(([rowStyle, labelColor]) => ({ ...rowStyle, labelColor }));

    const light = await read();
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    const dark = await read();

    expect(dark.background, 'row background follows the dark scheme').not.toBe(light.background);
    expect(dark.border, 'row separator follows the dark scheme').not.toBe(light.border);
    expect(dark.labelColor, 'label text follows the dark scheme').not.toBe(light.labelColor);
  });

  // Smoke check of the stacked docs demo, not a scenario test: the full scenario check lives in data-table-responsive-stack-features.spec.ts.
  test('stacked demo smoke: no frozen cell or row is sticky and a row keeps several cells', async ({ page }) => {
    const demo = await openDemo(page, NARROW);
    const stickyCount = await demo.evaluate((host) => {
      const cells = Array.from(host.querySelectorAll<HTMLElement>('thead th, tbody td, tbody tr, thead tr'));
      return cells.filter((el) => getComputedStyle(el).position === 'sticky' || el.classList.contains('sticky')).length;
    });
    expect(stickyCount).toBe(0);
    const firstRowCells = demo.locator('tbody tr').first().locator('td');
    expect(await firstRowCells.count()).toBeGreaterThan(1);
  });

  // Smoke check of the stacked docs demo, not a scenario test: the full scenario check lives in data-table-responsive-stack-features.spec.ts.
  test('stacked demo smoke: no resize handle shows and no header is draggable', async ({ page }) => {
    const demo = await openDemo(page, NARROW);
    await expect(demo.locator('[data-col-resize-handle="true"]')).toHaveCount(0);
    await expect(demo.locator('thead th[draggable="true"]')).toHaveCount(0);
  });

  // Smoke check of the stacked docs demo, not a scenario test: the full scenario check lives in data-table-responsive-stack-features.spec.ts.
  test('stacked demo smoke: the header is not sticky and the header group is visually hidden', async ({ page }) => {
    const demo = await openDemo(page, NARROW);
    const thead = demo.locator('thead').first();
    expect(await thead.evaluate((el) => getComputedStyle(el).position)).not.toBe('sticky');
    const groupRows = demo.locator('thead tr.sr-only');
    for (let i = 0; i < (await groupRows.count()); i++) {
      const box = await groupRows.nth(i).boundingBox();
      expect(box === null || box.height <= 1).toBe(true);
    }
  });

  // Smoke check of the stacked docs demo, not a scenario test: the full scenario check lives in data-table-responsive-stack-features.spec.ts.
  test('stacked demo smoke: widening past the breakpoint restores the table header layout', async ({ page }) => {
    const demo = await openDemo(page, NARROW);
    await expect(demo.locator('[data-col-resize-handle="true"]')).toHaveCount(0);

    await page.setViewportSize({ width: WIDE, height: 900 });
    await expect.poll(() => displayOf(tableOf(demo))).toBe('table');
    expect(await displayOf(demo.locator('thead').first())).toBe('table-header-group');
    await expect(demo.locator('thead th').first()).toBeVisible();
  });

  // DAT-024.S16
  test('DAT-024.S16: the responsive stack example has prose, a live demo, a code block, and labels its cells at a narrow viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: WIDE, height: 900 });
    await page.goto(PAGE);
    const section = page.locator('article #example-responsive-stack');
    await expect(section).toBeAttached();
    await expect(page.getByRole('navigation', { name: 'On this page' }).locator('a[href$="#example-responsive-stack"]')).toHaveCount(1);

    const demo = page.locator(DEMO);
    await expect(demo).toBeAttached();
    expect(await section.evaluate((el) => (el.textContent ?? '').trim().length), 'the example has prose').toBeGreaterThan(0);
    await expect(section.locator('xpath=following::app-code-block[1]')).toBeAttached();

    await page.setViewportSize({ width: NARROW, height: 900 });
    await demo.scrollIntoViewIfNeeded();
    await expect.poll(() => labelsOf(demo).count()).toBeGreaterThan(0);
  });

  // DAT-050.S7
  test('DAT-050.S7: breakpointMode="container" stacks and unstacks based on container width inside a wide viewport', async ({
    page,
  }) => {
    const demo = await openDemo(page, WIDE);
    const container = demo.locator('[data-med-container-stack-demo]');
    const table = container.locator('med-data-table table');
    await container.scrollIntoViewIfNeeded();

    await expect.poll(() => displayOf(table)).toBe('table');

    await container.evaluate((el) => {
      (el as HTMLElement).style.width = '420px';
    });
    await expect.poll(() => displayOf(table)).toBe('block');

    await container.evaluate((el) => {
      (el as HTMLElement).style.width = '500px';
    });
    await expect.poll(() => displayOf(table)).toBe('table');
  });

  // DAT-060.S1
  test('DAT-060.S1: visible stacked sort bar sorts rows, shows focus ring, and styles in dark mode', async ({ page }) => {
    const demo = await openDemo(page, NARROW);
    const sortBar = demo.locator('[data-med-stack-sort]').first();
    await expect(sortBar).toBeVisible();

    const lightBg = await sortBar.evaluate((el) => getComputedStyle(el).backgroundColor);
    const select = sortBar.locator('select');
    await select.selectOption('role');
    await expect(demo.locator('thead th[scope="col"]').nth(1).first()).toHaveAttribute('aria-sort', 'ascending');

    const roleValues = async () =>
      demo
        .locator('med-data-table')
        .first()
        .locator('tbody tr')
        .evaluateAll((rows) =>
          rows.map((tr) => tr.querySelectorAll('td')[1]?.textContent?.replace(/^Role/, '').trim() ?? ''),
        );
    const ascRoles = await roleValues();
    expect(ascRoles.length).toBeGreaterThan(1);
    expect(ascRoles).toEqual([...ascRoles].sort((a, b) => a.localeCompare(b)));

    const dirBtn = sortBar.locator('button[data-med-stack-sort-dir]');
    await select.focus();
    await page.keyboard.press('Tab');
    await expect(dirBtn).toBeFocused();
    const outline = await dirBtn.evaluate((el) => ({
      style: getComputedStyle(el).outlineStyle,
      width: parseFloat(getComputedStyle(el).outlineWidth),
    }));
    expect(outline.style).not.toBe('none');
    expect(outline.width).toBeGreaterThan(0);

    await dirBtn.click();
    await expect(demo.locator('thead th[scope="col"]').nth(1).first()).toHaveAttribute('aria-sort', 'descending');
    const descRoles = await roleValues();
    expect(descRoles).toEqual([...ascRoles].reverse());

    await page.evaluate(() => document.documentElement.classList.add('dark'));
    const darkBg = await sortBar.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(darkBg).not.toBe(lightBg);
  });
});
