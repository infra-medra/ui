import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableCellSelection, TableSelectionMode } from './data-table.types';

interface ItemRow {
  id: number;
  name: string;
  category: string;
  price: number;
}

const ITEMS: readonly ItemRow[] = [
  { id: 1, name: 'Alpha', category: 'Hardware', price: 10 },
  { id: 2, name: 'Beta', category: 'Hardware', price: 20 },
  { id: 3, name: 'Gamma', category: 'Software', price: 30 },
  { id: 4, name: 'Delta', category: 'Software', price: 40 },
  { id: 5, name: 'Epsilon', category: 'Services', price: 50 },
];

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="items()"
      [selectionMode]="selectionMode()"
      [keyboardNavigation]="keyboardNavigation()"
      [paginator]="paginator()"
      [rows]="rows()"
      [(selection)]="selection"
      ariaLabel="Keyboard selection table"
    >
      <med-table-column field="name" header="Name" />
      <med-table-column field="category" header="Category" />
      <med-table-column field="price" header="Price" />
    </med-data-table>
  `,
})
class RowKeyboardHostComponent {
  items = signal<readonly ItemRow[]>(ITEMS);
  selectionMode = signal<TableSelectionMode>(null);
  keyboardNavigation = signal(false);
  paginator = signal(false);
  rows = signal(10);
  selection: ItemRow | readonly ItemRow[] | null = null;
}

function createRowHost(configure?: (host: RowKeyboardHostComponent) => void): ComponentFixture<RowKeyboardHostComponent> {
  TestBed.configureTestingModule({ imports: [RowKeyboardHostComponent] });
  const fixture = TestBed.createComponent(RowKeyboardHostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  return fixture;
}

function bodyRows(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
}

function pressKey(
  target: HTMLElement,
  key: string,
  modifiers: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {},
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    shiftKey: !!modifiers.shiftKey,
    ctrlKey: !!modifiers.ctrlKey,
    metaKey: !!modifiers.metaKey,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

describe('DataTableComponent row keyboard selection & navigation (DAT-026)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  // DAT-026.S6
  it('DAT-026.S6: Shift+ArrowDown twice selects rows 2 through 4 and moves focus to row 4, then Shift+ArrowUp shrinks to rows 2 through 3 and moves focus to row 3', () => {
    const fixture = createRowHost((h) => h.selectionMode.set('multiple'));
    const rows = bodyRows(fixture);
    rows[1].focus();

    const first = pressKey(rows[1], 'ArrowDown', { shiftKey: true });
    fixture.detectChanges();
    expect(first.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(rows[2]);
    expect(fixture.componentInstance.selection).toEqual([ITEMS[1], ITEMS[2]]);

    const second = pressKey(rows[2], 'ArrowDown', { shiftKey: true });
    fixture.detectChanges();
    expect(second.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(rows[3]);
    expect(fixture.componentInstance.selection).toEqual([ITEMS[1], ITEMS[2], ITEMS[3]]);

    const up = pressKey(rows[3], 'ArrowUp', { shiftKey: true });
    fixture.detectChanges();
    expect(up.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(rows[2]);
    expect(fixture.componentInstance.selection).toEqual([ITEMS[1], ITEMS[2]]);
  });

  // DAT-026.S6
  it('DAT-026.S6: Shift+Home and Shift+End select contiguous ranges from the anchor row to the first and last row of the page', () => {
    const fixture = createRowHost((h) => h.selectionMode.set('multiple'));
    const rows = bodyRows(fixture);
    rows[2].focus();

    pressKey(rows[2], 'End', { shiftKey: true });
    fixture.detectChanges();
    expect(document.activeElement).toBe(rows[4]);
    expect(fixture.componentInstance.selection).toEqual([ITEMS[2], ITEMS[3], ITEMS[4]]);

    pressKey(rows[4], 'Home', { shiftKey: true });
    fixture.detectChanges();
    expect(document.activeElement).toBe(rows[0]);
    expect(fixture.componentInstance.selection).toEqual([ITEMS[0], ITEMS[1], ITEMS[2]]);
  });

  // DAT-026.S7
  it('DAT-026.S7: Ctrl+A on a focused body row in multiple mode selects every loaded row and prevents default text selection', () => {
    const fixture = createRowHost((h) => h.selectionMode.set('multiple'));
    const rows = bodyRows(fixture);
    rows[1].focus();

    const event = pressKey(rows[1], 'a', { ctrlKey: true });
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.selection).toEqual([...ITEMS]);
  });

  // DAT-026.S7
  it('DAT-026.S7: Meta+A selects every loaded row and Ctrl+A on a checkbox inside the row does not hijack the shortcut', () => {
    const fixture = createRowHost((h) => h.selectionMode.set('multiple'));
    const rows = bodyRows(fixture);
    const checkbox = rows[0].querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.focus();

    const checkboxEvent = pressKey(checkbox, 'a', { ctrlKey: true });
    fixture.detectChanges();
    expect(checkboxEvent.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.selection).toBeNull();

    rows[0].focus();
    const metaEvent = pressKey(rows[0], 'a', { metaKey: true });
    fixture.detectChanges();
    expect(metaEvent.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.selection).toEqual([...ITEMS]);
  });

  // DAT-026.S8
  it('DAT-026.S8: without selectionMode and with keyboardNavigation=true, ArrowDown, End, and Home move row focus and leave selection unchanged', () => {
    const fixture = createRowHost((h) => {
      h.keyboardNavigation.set(true);
      h.paginator.set(true);
      h.rows.set(3);
    });
    const rows = bodyRows(fixture);
    expect(rows).toHaveLength(3);
    expect(rows[0].getAttribute('tabindex')).toBe('0');

    rows[0].focus();
    const down = pressKey(rows[0], 'ArrowDown');
    fixture.detectChanges();
    expect(down.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(rows[1]);

    const end = pressKey(rows[1], 'End');
    fixture.detectChanges();
    expect(end.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(rows[2]);

    const home = pressKey(rows[2], 'Home');
    fixture.detectChanges();
    expect(home.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(rows[0]);

    expect(fixture.componentInstance.selection).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="items()"
      [cellSelection]="true"
      [selectionMode]="selectionMode()"
      [(selection)]="selection"
      ariaLabel="Cell keyboard selection table"
    >
      <med-table-column field="name" header="Name" />
      <med-table-column field="category" header="Category" />
      <med-table-column field="price" header="Price" />
      <med-table-column field="id" header="ID" [visible]="showIdColumn()" />
    </med-data-table>
  `,
})
class CellKeyboardHostComponent {
  items = signal<readonly ItemRow[]>(ITEMS);
  selectionMode = signal<'single' | 'multiple' | null>('multiple');
  showIdColumn = signal(false);
  selection: TableCellSelection<ItemRow> | readonly TableCellSelection<ItemRow>[] | null = null;
}

function createCellHost(configure?: (host: CellKeyboardHostComponent) => void): ComponentFixture<CellKeyboardHostComponent> {
  TestBed.configureTestingModule({ imports: [CellKeyboardHostComponent] });
  const fixture = TestBed.createComponent(CellKeyboardHostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  return fixture;
}

function cellAt(fixture: ComponentFixture<unknown>, rowIndex: number, colIndex: number): HTMLElement {
  const rows = bodyRows(fixture);
  return rows[rowIndex].querySelectorAll<HTMLElement>('td')[colIndex];
}

describe('DataTableComponent cell keyboard & drag selection (DAT-043)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  // DAT-043.S3
  it('DAT-043.S3: ArrowRight moves focus without selecting, then Shift+ArrowDown and Shift+ArrowRight select the rectangular range', () => {
    const fixture = createCellHost();
    const startCell = cellAt(fixture, 1, 0);
    startCell.focus();

    const right = pressKey(startCell, 'ArrowRight');
    fixture.detectChanges();
    expect(right.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(cellAt(fixture, 1, 1));
    expect(fixture.componentInstance.selection).toBeNull();

    const shiftDown = pressKey(cellAt(fixture, 1, 1), 'ArrowDown', { shiftKey: true });
    fixture.detectChanges();
    expect(shiftDown.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(cellAt(fixture, 2, 1));
    expect(fixture.componentInstance.selection).toEqual([
      { row: ITEMS[1], field: 'category' },
      { row: ITEMS[2], field: 'category' },
    ]);

    const shiftRight = pressKey(cellAt(fixture, 2, 1), 'ArrowRight', { shiftKey: true });
    fixture.detectChanges();
    expect(shiftRight.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(cellAt(fixture, 2, 2));
    expect(fixture.componentInstance.selection).toEqual([
      { row: ITEMS[1], field: 'category' },
      { row: ITEMS[1], field: 'price' },
      { row: ITEMS[2], field: 'category' },
      { row: ITEMS[2], field: 'price' },
    ]);
  });

  // DAT-043.S3
  it('DAT-043.S3: ArrowLeft, ArrowUp, Home, and End navigate cells within table bounds without wrapping and Shift+Home/Shift+End select row-bounded rectangles', () => {
    const fixture = createCellHost((h) => h.selectionMode.set('single'));
    cellAt(fixture, 0, 0).focus();

    pressKey(cellAt(fixture, 0, 0), 'ArrowUp');
    pressKey(cellAt(fixture, 0, 0), 'ArrowLeft');
    expect(document.activeElement).toBe(cellAt(fixture, 0, 0));

    pressKey(cellAt(fixture, 0, 0), 'End');
    expect(document.activeElement).toBe(cellAt(fixture, 0, 2));
    pressKey(cellAt(fixture, 0, 2), 'ArrowRight');
    expect(document.activeElement).toBe(cellAt(fixture, 0, 2));

    pressKey(cellAt(fixture, 0, 2), 'Home');
    expect(document.activeElement).toBe(cellAt(fixture, 0, 0));
    expect(fixture.componentInstance.selection).toBeNull();

    // Multiple mode Shift+End and Shift+Home
    fixture.componentInstance.selectionMode.set('multiple');
    fixture.detectChanges();

    cellAt(fixture, 1, 0).focus();
    pressKey(cellAt(fixture, 1, 0), 'End', { shiftKey: true });
    fixture.detectChanges();
    expect(document.activeElement).toBe(cellAt(fixture, 1, 2));
    expect(fixture.componentInstance.selection).toEqual([
      { row: ITEMS[1], field: 'name' },
      { row: ITEMS[1], field: 'category' },
      { row: ITEMS[1], field: 'price' },
    ]);

    pressKey(cellAt(fixture, 1, 2), 'Home', { shiftKey: true });
    fixture.detectChanges();
    expect(document.activeElement).toBe(cellAt(fixture, 1, 0));
    expect(fixture.componentInstance.selection).toEqual([{ row: ITEMS[1], field: 'name' }]);

    pressKey(cellAt(fixture, 1, 0), 'End');
    fixture.detectChanges();
    expect(document.activeElement).toBe(cellAt(fixture, 1, 2));

    pressKey(cellAt(fixture, 1, 2), 'Home', { shiftKey: true });
    fixture.detectChanges();
    expect(document.activeElement).toBe(cellAt(fixture, 1, 0));
    expect(fixture.componentInstance.selection).toEqual([
      { row: ITEMS[1], field: 'name' },
      { row: ITEMS[1], field: 'category' },
      { row: ITEMS[1], field: 'price' },
    ]);
  });

  // DAT-043.S4
  it('DAT-043.S4: Ctrl+A on a focused data cell in multiple mode selects all loaded rows and visible columns and prevents default text selection', () => {
    const fixture = createCellHost();
    const cell = cellAt(fixture, 0, 1);
    cell.focus();

    const event = pressKey(cell, 'a', { ctrlKey: true });
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    const expected: TableCellSelection<ItemRow>[] = [];
    for (const row of ITEMS) {
      for (const field of ['name', 'category', 'price']) {
        expected.push({ row, field });
      }
    }
    expect(fixture.componentInstance.selection).toEqual(expected);
  });

  // DAT-043.S4
  it('DAT-043.S4: Meta+A selects all cells in multiple mode while Ctrl+A in single mode does not select all cells', () => {
    const fixture = createCellHost((h) => h.selectionMode.set('single'));
    const cell = cellAt(fixture, 0, 0);
    cell.focus();

    const singleEvent = pressKey(cell, 'a', { ctrlKey: true });
    fixture.detectChanges();
    expect(singleEvent.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.selection).toBeNull();

    fixture.componentInstance.selectionMode.set('multiple');
    fixture.detectChanges();
    const metaEvent = pressKey(cell, 'a', { metaKey: true });
    fixture.detectChanges();
    expect(metaEvent.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.selection).toHaveLength(ITEMS.length * 3);
  });

  // DAT-043.S5
  it('DAT-043.S5: mouse drag from (0, 0) to (1, 1) selects the 2x2 rectangular cell range and mouseenter after mouseup does not alter selection', () => {
    const fixture = createCellHost();
    const anchor = cellAt(fixture, 0, 0);
    const target = cellAt(fixture, 1, 1);
    const outsideTarget = cellAt(fixture, 2, 2);

    anchor.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true, cancelable: true }));
    target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    target.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.selection).toEqual([
      { row: ITEMS[0], field: 'name' },
      { row: ITEMS[0], field: 'category' },
      { row: ITEMS[1], field: 'name' },
      { row: ITEMS[1], field: 'category' },
    ]);

    outsideTarget.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    fixture.detectChanges();

    expect(fixture.componentInstance.selection).toEqual([
      { row: ITEMS[0], field: 'name' },
      { row: ITEMS[0], field: 'category' },
      { row: ITEMS[1], field: 'name' },
      { row: ITEMS[1], field: 'category' },
    ]);
  });

  // DAT-043.S5
  it('DAT-043.S5: reverse drag selects the rectangular range and non-primary mouse button does not start drag selection', () => {
    const fixture = createCellHost();

    cellAt(fixture, 2, 2).dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true, cancelable: true }));
    cellAt(fixture, 1, 1).dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    document.dispatchEvent(new MouseEvent('mouseup', { button: 2, bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toBeNull();

    cellAt(fixture, 2, 2).dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true, cancelable: true }));
    cellAt(fixture, 1, 1).dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    document.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.selection).toEqual([
      { row: ITEMS[1], field: 'category' },
      { row: ITEMS[1], field: 'price' },
      { row: ITEMS[2], field: 'category' },
      { row: ITEMS[2], field: 'price' },
    ]);
  });

  // F-03: verify remediation
  it('DAT-043.S5: Shift+Arrow after an out-and-back drag re-anchors at the focused cell instead of stale keyboard anchor', () => {
    const fixture = createCellHost();
    cellAt(fixture, 0, 0).focus();
    pressKey(cellAt(fixture, 0, 0), 'ArrowDown', { shiftKey: true });
    fixture.detectChanges();

    // Drag from (1, 0) out to (1, 1) and back onto (1, 0), then release
    cellAt(fixture, 1, 0).dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true, cancelable: true }));
    cellAt(fixture, 1, 1).dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    cellAt(fixture, 1, 0).dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    document.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }));
    fixture.detectChanges();

    // Shift+ArrowRight from (1, 0) should anchor at (1, 0), not (0, 0)
    pressKey(cellAt(fixture, 1, 0), 'ArrowRight', { shiftKey: true });
    fixture.detectChanges();

    expect(fixture.componentInstance.selection).toEqual([
      { row: ITEMS[1], field: 'name' },
      { row: ITEMS[1], field: 'category' },
    ]);
  });

  // F-01: verify remediation
  it('DAT-043.S3: Shift+ArrowDown in a scrolled virtualScroll table selects the adjacent rendered rows rather than top-of-dataset rows', () => {
    const manyItems = Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      category: 'Cat',
      price: (i + 1) * 10,
    }));

    @Component({
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items"
          [virtualScroll]="true"
          [virtualScrollItemSize]="40"
          scrollHeight="160px"
          [cellSelection]="true"
          selectionMode="multiple"
          [(selection)]="selection"
        >
          <med-table-column field="name" header="Name" />
          <med-table-column field="category" header="Category" />
        </med-data-table>
      `,
    })
    class VirtualCellHostComponent {
      items = manyItems;
      selection: TableCellSelection<Item>[] | null = null;
    }

    const fixture = TestBed.createComponent(VirtualCellHostComponent);
    fixture.detectChanges();

    const viewport = fixture.nativeElement.querySelector('[data-med-scroll-viewport]') as HTMLElement;
    viewport.scrollTop = 400; // row 10+
    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    const renderedRows = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr[aria-rowindex]'),
    ) as HTMLElement[];
    expect(renderedRows.length).toBeGreaterThan(2);
    const firstRenderedCell = renderedRows[0].querySelector('td[data-med-field="name"]') as HTMLElement;
    const secondRowIndex = Number(renderedRows[1].getAttribute('aria-rowindex')) - 2; // 1 header row + 1-based
    const firstRowIndex = Number(renderedRows[0].getAttribute('aria-rowindex')) - 2;

    firstRenderedCell.focus();
    pressKey(firstRenderedCell, 'ArrowDown', { shiftKey: true });
    fixture.detectChanges();

    expect(fixture.componentInstance.selection).toEqual([
      { row: manyItems[firstRowIndex], field: 'name' },
      { row: manyItems[secondRowIndex], field: 'name' },
    ]);
  });
});
