import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE = '/docs/components/data-table';

const PERSISTED_FIELDS = [
  'first',
  'sortField',
  'sortOrder',
  'expandedRowKeys',
  'columnFilters',
  'columnOrder',
  'columnWidths',
  'columnVisibility',
  'collapsedRowGroups',
  'globalFilter',
  'multiSortMeta',
  'rows',
] as const;

const demoOf = (page: Page): Locator => page.locator('app-data-table-stateful-demo');

async function hydrated(demo: Locator): Promise<void> {
  await expect(demo.locator('thead th[scope="col"][jsaction]'), 'the headers did not hydrate').toHaveCount(0, {
    timeout: 10_000,
  });
}

async function headerLabels(demo: Locator): Promise<string[]> {
  const labels = await demo.locator('thead th[scope="col"]').allInnerTexts();
  return labels.map((label) => label.replace(/\s+/g, ' ').trim());
}

async function dragResizeHandleToWidth(page: Page, header: Locator, targetWidthPx: number): Promise<void> {
  const startBox = await header.boundingBox();
  expect(startBox, 'header cell is rendered').not.toBeNull();
  const handle = header.locator('[data-col-resize-handle="true"]');
  const handleBox = await handle.boundingBox();
  expect(handleBox, 'resize handle is rendered').not.toBeNull();

  const dx = Math.round(targetWidthPx - startBox!.width);
  const x = handleBox!.x + handleBox!.width / 2;
  const y = handleBox!.y + handleBox!.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y);
  await page.mouse.move(x + dx, y);
  await page.mouse.up();
}

test.describe('DataTable persisted state docs & round trip', () => {
  // DAT-024.S18
  test('DAT-024.S18: persisted state section has prose listing all persisted fields, extended demo controls, and a code block', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PAGE);

    const section = page.locator('#example-stateful');
    await expect(section).toBeAttached();
    await section.scrollIntoViewIfNeeded();

    const prose = section.locator('app-prose');
    await expect(prose).toBeVisible();
    const proseText = (await prose.innerText()).trim();
    for (const field of PERSISTED_FIELDS) {
      expect(proseText, `prose does not list persisted field "${field}"`).toContain(field);
    }
    expect(proseText, 'prose does not document local storage / sign-out guidance').toMatch(/local/i);
    expect(proseText, 'prose does not document sign-out clearing guidance').toMatch(/sign.?out/i);

    const demo = section.locator('app-data-table-stateful-demo');
    await expect(demo).toBeVisible();
    await hydrated(demo);
    expect(await demo.locator('thead th[scope="col"][draggable="true"]').count()).toBeGreaterThanOrEqual(2);
    expect(await demo.locator('thead th[scope="col"] [data-col-resize-handle="true"]').count()).toBeGreaterThanOrEqual(1);
    expect(await demo.getByRole('checkbox').count()).toBeGreaterThanOrEqual(1);
    await expect(demo.getByRole('searchbox')).toBeVisible();
    const rowsPerPage = demo.getByLabel('Rows per page');
    await expect(rowsPerPage).toBeVisible();
    expect(await rowsPerPage.locator('option').count()).toBeGreaterThanOrEqual(2);

    const codeBlock = section.locator('app-code-block pre code');
    await expect(codeBlock).toBeVisible();
    const codeText = await codeBlock.innerText();
    expect(codeText).toContain('stateKey');
    expect(codeText).toContain('[(visible)]');
    expect(codeText).toContain('reorderableColumns');
    expect(codeText).toContain('resizableColumns');
    expect(codeText).toContain('filterable');
    expect(codeText).toContain('rowsPerPageOptions');
  });

  // DAT-056.S1
  test('DAT-056.S1: extended persisted state round trip preserves column order, 180 px width, visibility, global filter, and page size after reload', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(PAGE);

    const demo = demoOf(page);
    await expect(demo).toBeAttached();
    await demo.scrollIntoViewIfNeeded();
    await hydrated(demo);

    const before = await headerLabels(demo);
    expect(before.length, 'demo needs at least 3 columns').toBeGreaterThanOrEqual(3);
    const nameIndex = before.findIndex((label) => label.startsWith('Name'));
    expect(nameIndex, 'demo needs a Name column').toBeGreaterThanOrEqual(0);

    // 1. Reorder: move the third column to first position so Name stays followed by a visible column during resize.
    const headers = demo.locator('thead th[scope="col"]');
    await headers.nth(2).dragTo(headers.nth(0));
    await expect.poll(() => headerLabels(demo)).toEqual([before[2], before[0], before[1], ...before.slice(3)]);

    // 2. Resize Name column to 180 px.
    const nameHeader = demo.locator('thead th[scope="col"]', { hasText: 'Name' });
    await dragResizeHandleToWidth(page, nameHeader, 180);
    await expect.poll(async () => Math.round((await nameHeader.boundingBox())!.width)).toBe(180);

    // 3. Hide the third column (before[1], e.g. Category) via its [(visible)] toggle.
    const hiddenLabel = before[1];
    const toggle = demo.getByRole('checkbox', { name: new RegExp(hiddenLabel, 'i') });
    await toggle.uncheck();
    await expect.poll(() => headerLabels(demo)).not.toContain(hiddenLabel);

    // 4. Commit a global filter query that matches multiple rows while filtering out at least one.
    const searchbox = demo.getByRole('searchbox');
    await searchbox.fill('o');
    await expect(demo.locator('tbody tr', { hasText: 'Multimeter' })).toHaveCount(0);

    // 5. Pick a different page size from rowsPerPageOptions.
    const rowsSelect = demo.getByLabel('Rows per page');
    const currentRows = await rowsSelect.inputValue();
    const optionValues = await rowsSelect.locator('option').evaluateAll((opts) =>
      opts.map((opt) => (opt as HTMLOptionElement).value),
    );
    const nextRows = optionValues.find((value) => value !== currentRows);
    expect(nextRows, 'rowsPerPageOptions must offer at least two distinct sizes').toBeDefined();
    await rowsSelect.selectOption(nextRows!);
    await expect(rowsSelect).toHaveValue(nextRows!);

    // Reload the page and verify extended persisted state is restored from storage.
    await page.reload();
    const restored = demoOf(page);
    await expect(restored).toBeAttached();
    await restored.scrollIntoViewIfNeeded();
    await hydrated(restored);

    // Restored visibility hides hiddenLabel, and restored order keeps before[2] before Name.
    await expect(restored.getByRole('checkbox', { name: new RegExp(hiddenLabel, 'i') })).not.toBeChecked();
    expect(await headerLabels(restored)).toEqual([before[2], before[0], ...before.slice(3)]);

    // Restored Name column renders at 180 px width after reload.
    const restoredNameHeader = restored.locator('thead th[scope="col"]', { hasText: 'Name' });
    const restoredNameBox = await restoredNameHeader.boundingBox();
    expect(restoredNameBox, 'Name header is rendered after reload').not.toBeNull();
    expect(restoredNameBox!.width).toBeCloseTo(180, 0);

    // Restored global filter appears in the search box immediately and keeps rows filtered.
    await expect(restored.getByRole('searchbox')).toHaveValue('o');
    await expect(restored.locator('tbody tr', { hasText: 'Multimeter' })).toHaveCount(0);
    expect(await restored.locator('tbody tr').count()).toBeGreaterThan(0);

    // Restored page size persists in the paginator select and slices the rendered rows.
    await expect(restored.getByLabel('Rows per page')).toHaveValue(nextRows!);
    expect(await restored.locator('tbody tr').count()).toBeLessThanOrEqual(Number(nextRows));
  });
});
