import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Real-browser checks of the stacked layout combined with other DataTable features (DAT-050, DAT-052).
 * They complement `data-table-responsive-stack.spec.ts` with the second table of the responsive stack
 * demo, which has a frozen column and row, a `#headerGroup` row, subheader groups, an expanded row,
 * `scrollHeight="300px"` and a column hidden with `visible`, and with its third table, which edits a row at a time.
 */

const PAGE = '/docs/components/data-table';
const DEMO = 'app-data-table-responsive-stack-demo';
const NARROW = 400;
const WIDE = 1280;
const DATA_HEADERS = ['Name', 'Team', 'Shift', 'Room'];

/** Opens the docs page at `width` and scrolls the responsive stack demo into view. */
async function openDemo(page: Page, width: number): Promise<Locator> {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(PAGE);
  const demo = page.locator(DEMO);
  await expect(demo).toBeAttached();
  await demo.scrollIntoViewIfNeeded();
  return demo;
}

/** The first (basic) and second (features) tables of the demo. */
const basicTable = (demo: Locator): Locator => demo.locator('med-data-table').nth(0);
const featuresTable = (demo: Locator): Locator => demo.locator('med-data-table').nth(1);
/** The third table of the demo, with `editMode="row"` and an editable "Supervisor" column. */
const editTable = (demo: Locator): Locator => demo.locator('med-data-table').nth(2);

const displayOf = (locator: Locator): Promise<string> => locator.evaluate((el) => getComputedStyle(el).display);

/** Waits until the table is stacked: the table element renders as a block. */
async function expectStacked(table: Locator): Promise<void> {
  await expect.poll(() => displayOf(table.locator('table'))).toBe('block');
}

/** Data rows, frozen ones included: every row except the subheader and expansion rows, whose cells span columns. */
const dataRows = (table: Locator): Locator => table.locator('tbody tr:not(:has(> td[colspan]))');

/** For each data row: its name value and the label of every cell (`null` when the cell has no label). */
function readRows(table: Locator): Promise<{ name: string; labels: (string | null)[] }[]> {
  return dataRows(table).evaluateAll((rows) =>
    rows.map((row) => {
      const cells = Array.from(row.querySelectorAll<HTMLElement>(':scope > td'));
      const labels = cells.map((cell) => cell.querySelector(':scope > [aria-hidden="true"]')?.textContent?.trim() ?? null);
      const first = cells[0].cloneNode(true) as HTMLElement;
      first.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
      return { name: first.textContent?.trim() ?? '', labels };
    }),
  );
}

test.describe('DataTable responsive stack with other features', () => {
  // DAT-052.S2
  test('DAT-052.S2: in a scrollable stacked table the frozen column and frozen row are not sticky, keep their normal order and every cell is labelled', async ({
    page,
  }) => {
    const demo = await openDemo(page, NARROW);
    const table = featuresTable(demo);
    await expectStacked(table);

    const sticky = await table.evaluate((host) =>
      Array.from(host.querySelectorAll<HTMLElement>('table, thead, tbody, tr, th, td'))
        .filter((el) => getComputedStyle(el).position === 'sticky')
        .map((el) => el.tagName),
    );
    expect(sticky, 'no sticky element while stacked').toEqual([]);

    // The frozen row renders first, in its own row group, then the body rows in data order.
    const rows = await readRows(table);
    expect(rows.map((row) => row.name)).toEqual(['Gabriela Rocha', 'Ana Souza', 'Diego Ramos', 'Bruno Lima', 'Felipe Nunes']);
    for (const row of rows) {
      expect(row.labels, `labels of ${row.name}`).toEqual(DATA_HEADERS);
    }
    // The frozen name cell sits at the left of its row and not over the body: it follows the normal flow of its row.
    const frozenCell = dataRows(table).first().locator('td').first();
    const nextRowCell = dataRows(table).nth(1).locator('td').first();
    const frozenBox = (await frozenCell.boundingBox())!;
    const nextBox = (await nextRowCell.boundingBox())!;
    expect(nextBox.y).toBeGreaterThanOrEqual(frozenBox.y + frozenBox.height - 1);
  });

  // DAT-052.S3
  test('DAT-052.S3: a stacked table with resizable and reorderable columns shows no resize handle, no draggable header and no cell for the hidden column', async ({
    page,
  }) => {
    const demo = await openDemo(page, NARROW);
    const table = featuresTable(demo);
    await expectStacked(table);

    await expect(table.locator('[data-col-resize-handle="true"]')).toHaveCount(0);
    await expect(table.locator('thead th[draggable="true"]')).toHaveCount(0);
    // The Badge column has `visible` false: no header, no body cell and no label.
    await expect(table.locator('[data-med-field="badge"]')).toHaveCount(0);
    expect(await table.locator('thead tr[data-med-header-row] th').allTextContents().then((texts) => texts.map((t) => t.trim()))).toEqual(DATA_HEADERS);
    const rows = await readRows(table);
    expect(rows.map((row) => row.labels.length)).toEqual(rows.map(() => DATA_HEADERS.length));
    expect(rows.flatMap((row) => row.labels)).not.toContain('Badge');

    // Unstacked, the same table has resize handles and draggable headers, so the checks above can fail.
    await page.setViewportSize({ width: WIDE, height: 900 });
    await expect.poll(() => table.locator('[data-col-resize-handle="true"]').count()).toBeGreaterThan(0);
    expect(await table.locator('thead th[draggable="true"]').count()).toBeGreaterThan(0);
  });

  // DAT-052.S6
  test('DAT-052.S6: a stacked table scrolls its body within 300px with a header that is not sticky, and the header group is hidden and labels nothing', async ({
    page,
  }) => {
    const demo = await openDemo(page, NARROW);
    const table = featuresTable(demo);
    await expectStacked(table);
    const viewport = table.locator('[data-med-scroll-viewport]');

    const metrics = await viewport.evaluate((el) => ({
      maxHeight: getComputedStyle(el).maxHeight,
      overflowY: getComputedStyle(el).overflowY,
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
    }));
    expect(metrics.maxHeight).toBe('300px');
    expect(metrics.overflowY).toBe('auto');
    expect(metrics.clientHeight).toBeLessThanOrEqual(300);
    expect(metrics.scrollHeight, 'the stacked body overflows, so it scrolls vertically').toBeGreaterThan(metrics.clientHeight);

    const thead = table.locator('thead');
    expect(await thead.evaluate((el) => getComputedStyle(el).position)).not.toBe('sticky');
    // Scrolling the body moves the header out of place: a sticky header would stay at the viewport's top edge.
    const before = (await thead.boundingBox())!;
    await viewport.evaluate((el) => el.scrollTo({ top: 200 }));
    await expect.poll(async () => (await thead.boundingBox())!.y).toBeLessThan(before.y - 100);

    // The header group row ("Person", "Schedule") is in the DOM, visually hidden, and no cell label comes from it.
    const groupRow = table.locator('thead tr', { hasText: 'Person' });
    await expect(groupRow).toHaveCount(1);
    expect(await displayOf(groupRow)).not.toBe('none');
    const groupBox = await groupRow.boundingBox();
    expect(groupBox === null || (groupBox.width <= 1 && groupBox.height <= 1)).toBe(true);
    const labels = (await readRows(table)).flatMap((row) => row.labels);
    expect(labels).not.toContain('Person');
    expect(labels).not.toContain('Schedule');
  });

  // DAT-052 (expansion and subheader rows as full-width blocks)
  test('DAT-052: while stacked the subheader rows and the expansion row are blocks as wide as the table', async ({ page }) => {
    const demo = await openDemo(page, NARROW);
    const table = featuresTable(demo);
    await expectStacked(table);
    const tableWidth = (await table.locator('table').boundingBox())!.width;

    const subheaderCells = table.locator('tbody td[colspan]', { hasText: /^\s*(On call|Lab A|Lab B)\s*$/ });
    expect(await subheaderCells.count()).toBe(2);
    const expansionCell = table.locator('tbody td', { hasText: 'covers Room 101' });
    await expect(expansionCell).toHaveCount(1);

    for (const cell of [subheaderCells.nth(0), subheaderCells.nth(1), expansionCell]) {
      const row = cell.locator('xpath=..');
      expect(await displayOf(row)).toBe('block');
      expect(await displayOf(cell)).toBe('block');
      const rowBox = (await row.boundingBox())!;
      const cellBox = (await cell.boundingBox())!;
      expect(Math.abs(rowBox.width - tableWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(cellBox.width - tableWidth)).toBeLessThanOrEqual(1);
    }
    // The expansion row sits directly under the row it expands.
    const expandedRow = dataRows(table).filter({ hasText: 'Room 101' }).first();
    const expandedBox = (await expandedRow.boundingBox())!;
    const expansionBox = (await expansionCell.boundingBox())!;
    expect(expansionBox.y).toBeGreaterThanOrEqual(expandedBox.y + expandedBox.height - 1);
  });

  // DAT-052.S8
  test('DAT-052.S8: widening past the breakpoint makes the frozen column sticky again, sorts on a header click and shows the resize handle', async ({
    page,
  }) => {
    const demo = await openDemo(page, NARROW);
    const table = basicTable(demo);
    await expectStacked(table);
    await expect(table.locator('[data-col-resize-handle="true"]')).toHaveCount(0);

    await page.setViewportSize({ width: WIDE, height: 900 });
    await expect.poll(() => displayOf(table.locator('table'))).toBe('table');

    const frozenCell = table.locator('tbody tr').first().locator('td').first();
    expect(await frozenCell.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
    expect(await table.locator('[data-col-resize-handle="true"]').count()).toBeGreaterThan(0);

    const nameHeader = table.locator('thead th', { hasText: 'Name' }).first();
    const before = await nameHeader.getAttribute('aria-sort');
    expect(before).not.toBe('ascending');
    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  // DAT-052.S7
  test('DAT-052.S7: activating the edit button of a stacked row shows the edit template under the label, and the actions cell shows its buttons with no label', async ({
    page,
  }) => {
    const demo = await openDemo(page, NARROW);
    const table = editTable(demo);
    await expectStacked(table);
    await table.scrollIntoViewIfNeeded();

    // Given: a stacked table with editMode="row" and an editable column.
    const row = table.locator('tbody tr').first();
    const supervisorCell = row.locator('td', { has: page.locator(':scope > [aria-hidden="true"]', { hasText: 'Supervisor' }) });
    await expect(supervisorCell).toHaveCount(1);
    await expect(supervisorCell.locator('input')).toHaveCount(0);

    // When: the user activates the row's edit button.
    await row.getByRole('button', { name: 'Edit row' }).click();

    // Then: the cell shows its edit template under the label.
    const editor = supervisorCell.locator('input');
    await expect(editor).toBeVisible();
    const label = supervisorCell.locator(':scope > [aria-hidden="true"]');
    const labelBox = await label.boundingBox();
    const editorBox = await editor.boundingBox();
    expect(labelBox, 'label is rendered').not.toBeNull();
    expect(editorBox, 'editor is rendered').not.toBeNull();
    expect(editorBox!.y, 'the editor starts at or below the bottom edge of the label').toBeGreaterThanOrEqual(labelBox!.y + labelBox!.height - 1);
    expect(Math.abs(editorBox!.x - labelBox!.x), 'the editor starts its own line, aligned with the label').toBeLessThanOrEqual(2);

    // And: the actions cell shows its buttons with no label.
    const actionsCell = row.locator('td', { has: page.getByRole('button', { name: 'Save row' }) });
    await expect(actionsCell).toHaveCount(1);
    await expect(actionsCell.getByRole('button', { name: 'Save row' })).toBeVisible();
    await expect(actionsCell.getByRole('button', { name: 'Cancel editing' })).toBeVisible();
    await expect(actionsCell.locator(':scope > [aria-hidden="true"]')).toHaveCount(0);
  });

  // DAT-050 (hydration-safe first render)
  test('DAT-050: loading the page below the breakpoint hydrates without errors and then stacks the table', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    page.on('pageerror', (error) => errors.push(error.message));

    const demo = await openDemo(page, NARROW);
    await expectStacked(basicTable(demo));
    await expectStacked(featuresTable(demo));
    expect(errors.filter((text) => /NG0\d+|hydrat/i.test(text))).toEqual([]);
  });
});
