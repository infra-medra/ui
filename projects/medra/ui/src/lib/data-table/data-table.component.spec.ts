import { Component, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { SelectComponent } from '../select/select.component';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableColumnFilters, TableFilterMatchMode } from './data-table.types';

interface Product {
  name: string;
  price: number;
  stock: number;
}

const PRODUCTS: Product[] = [
  { name: 'Widget', price: 30, stock: 5 },
  { name: 'Gadget', price: 10, stock: 0 },
  { name: 'Gizmo', price: 20, stock: 12 },
];

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      #dt
      [value]="products"
      [frozenValue]="frozenValue"
      [frozenRowsPosition]="frozenRowsPosition"
      [selectionMode]="selectionMode"
      [(selection)]="selection"
      [paginator]="paginator"
      [rows]="rows"
      [(first)]="first"
      [(sortField)]="sortField"
      [(sortOrder)]="sortOrder"
      [removableSort]="removableSort"
      [rowsPerPageOptions]="rowsPerPageOptions"
      [dataKey]="dataKey"
      [filterable]="filterable"
      [globalFilterFields]="globalFilterFields"
      [loading]="loading"
      [sortMode]="sortMode"
      [(multiSortMeta)]="multiSortMeta"
      [lazy]="lazy"
      [totalRecords]="totalRecords"
      [editMode]="editMode"
      [editTrigger]="editTrigger"
      [rowGroupMode]="rowGroupMode"
      [groupRowsBy]="groupRowsBy"
      [reorderable]="reorderable"
      (lazyLoad)="onLazyLoad($event)"
      (editComplete)="onEditComplete($event)"
      (editCancel)="onEditCancel($event)"
      (rowSelect)="onRowSelect($event)"
      (rowUnselect)="onRowUnselect($event)"
      (sort)="onSort($event)"
      (filter)="onFilter($event)"
      (rowReorder)="onRowReorder($event)"
      ariaLabel="Products"
    >
      <med-table-column field="name" header="Name" sortable editable>
        <ng-template let-row>{{ row.name }}</ng-template>
        <ng-template #editTemplate let-row let-onSave="onSave" let-onCancel="onCancel">
          <input class="edit-input" [value]="row.name" (keydown.enter)="onSave($any($event.target).value)" (keydown.escape)="onCancel()" />
        </ng-template>
      </med-table-column>
      <med-table-column field="price" header="Price" sortable align="right">
        <ng-template let-row>{{ '$' + row.price }}</ng-template>
      </med-table-column>
      <med-table-column field="stock" header="Stock" />
    </med-data-table>
  `,
})
class HostComponent {
  products: Product[] = PRODUCTS;
  frozenValue: Product[] | null = null;
  frozenRowsPosition: 'top' | 'bottom' = 'top';
  selectionMode: 'single' | 'multiple' | 'radio' | null = null;
  selection: Product | readonly Product[] | null = null;
  paginator = false;
  rows = 10;
  first = signal(0);
  sortField: string | null = null;
  sortOrder: 'asc' | 'desc' | null = null;
  removableSort = true;
  rowsPerPageOptions: readonly number[] | null = null;
  dataKey: string | null = null;
  filterable = false;
  globalFilterFields: readonly string[] | null = null;
  loading = false;
  sortMode: 'single' | 'multiple' = 'single';
  multiSortMeta: { field: string; order: 'asc' | 'desc' | null }[] = [];
  lazy = false;
  totalRecords: number | null = null;
  editMode: 'cell' | null = null;
  editTrigger: 'dblclick' | 'click' = 'dblclick';
  rowGroupMode: 'subheader' | null = null;
  groupRowsBy: string | null = null;
  reorderable = false;
  onLazyLoad = jest.fn();
  onEditComplete = jest.fn();
  onEditCancel = jest.fn();
  onRowSelect = jest.fn();
  onRowUnselect = jest.fn();
  onSort = jest.fn();
  onFilter = jest.fn();
  onRowReorder = jest.fn();
}

function headerCells(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('thead th'));
}

function bodyRows(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
}

function cellText(row: HTMLElement): string[] {
  return Array.from(row.querySelectorAll('td')).map((td) => td.textContent?.trim() ?? '');
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('DataTableComponent', () => {
  it('renders one header cell per column and one row per item', () => {
    const fixture = create();
    expect(headerCells(fixture).map((th) => th.textContent?.trim())).toEqual(['Name', 'Price', 'Stock']);
    expect(bodyRows(fixture)).toHaveLength(3);
  });

  it('renders default cell values from row[field], and custom cell templates when provided', () => {
    const fixture = create();
    const first = cellText(bodyRows(fixture)[0]);
    expect(first[0]).toBe('Widget'); // default rendering
    expect(first[1]).toBe('$30'); // custom <ng-template> for the price column
    expect(first[2]).toBe('5'); // default rendering
  });

  // DAT-001.S1
  it('shows the empty label and spans all columns when there is nothing to show', () => {
    const fixture = create((h) => (h.products = []));
    const rows = bodyRows(fixture);
    expect(rows).toHaveLength(1);
    expect(rows[0].querySelectorAll('td')).toHaveLength(1);
    expect(rows[0].textContent).toContain('No results found');
    expect(rows[0].querySelector('td')!.getAttribute('colspan')).toBe('3');
  });

  describe('sorting', () => {
    // DAT-002.S1
    it('clicking a sortable header cycles asc -> desc -> none (unsorted), not a two-state toggle', () => {
      const fixture = create();
      const priceHeader = headerCells(fixture)[1];

      priceHeader.click();
      fixture.detectChanges();
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Gadget'); // price 10, ascending
      expect(priceHeader.getAttribute('aria-sort')).toBe('ascending');

      priceHeader.click();
      fixture.detectChanges();
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Widget'); // price 30, descending
      expect(priceHeader.getAttribute('aria-sort')).toBe('descending');

      priceHeader.click();
      fixture.detectChanges();
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Widget'); // back to original (unsorted) order
      expect(priceHeader.getAttribute('aria-sort')).toBe('none');
    });

    // DAT-002.S3
    it('DAT-002.S3: renders sorted from the initial sortField and sortOrder', () => {
      const fixture = create((h) => {
        h.sortField = 'price';
        h.sortOrder = 'desc';
      });
      expect(bodyRows(fixture).map((r) => cellText(r)[0])).toEqual(['Widget', 'Gizmo', 'Gadget']);
      expect(headerCells(fixture)[1].getAttribute('aria-sort')).toBe('descending');
    });

    // DAT-002.S4
    it('DAT-002.S4: with removableSort false, a sorted column alternates asc/desc and never goes unsorted', () => {
      const fixture = create((h) => (h.removableSort = false));
      const priceHeader = headerCells(fixture)[1];
      const seen: (string | null)[] = [];
      for (let i = 0; i < 3; i++) {
        priceHeader.click();
        fixture.detectChanges();
        seen.push(priceHeader.getAttribute('aria-sort'));
      }
      expect(seen).toEqual(['ascending', 'descending', 'ascending']);
    });

    it('clicking a non-sortable header does nothing', () => {
      const fixture = create();
      const stockHeader = headerCells(fixture)[2];
      expect(stockHeader.getAttribute('aria-sort')).toBeNull();

      stockHeader.click();
      fixture.detectChanges();
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Widget'); // unchanged order
    });

    it('switching sort to a different column starts that column fresh at ascending', () => {
      const fixture = create();
      const [nameHeader, priceHeader] = headerCells(fixture);
      priceHeader.click(); // price ascending
      fixture.detectChanges();
      nameHeader.click();
      fixture.detectChanges();
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Gadget'); // alphabetically first
      expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
      expect(priceHeader.getAttribute('aria-sort')).toBe('none');
    });

    it('a sortable header is a real Tab stop; a non-sortable one is not (Wave 2 fix — 2026-08-19)', () => {
      const fixture = create();
      const [nameHeader, , stockHeader] = headerCells(fixture);
      expect(nameHeader.getAttribute('tabindex')).toBe('0');
      expect(stockHeader.getAttribute('tabindex')).toBeNull();
    });

    // DAT-002.S2
    it('Space on a focused sortable header cycles sort, same as a click (Wave 2 fix — 2026-08-19)', () => {
      const fixture = create();
      const priceHeader = headerCells(fixture)[1];

      priceHeader.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Gadget'); // price 10, ascending
      expect(priceHeader.getAttribute('aria-sort')).toBe('ascending');
    });

    it('Enter on a focused sortable header cycles sort, same as a click', () => {
      const fixture = create();
      const priceHeader = headerCells(fixture)[1];

      priceHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Gadget'); // price 10, ascending
      expect(priceHeader.getAttribute('aria-sort')).toBe('ascending');
    });

    it('Space on a focused non-sortable header does nothing', () => {
      const fixture = create();
      const stockHeader = headerCells(fixture)[2];

      stockHeader.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Widget'); // unchanged order
      expect(stockHeader.getAttribute('aria-sort')).toBeNull();
    });
  });

  describe('filtering', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    // DAT-004.S1
    it('DAT-004.S1: a global filter matches against any visible column value, after the debounce', () => {
      const fixture = create((h) => (h.filterable = true));
      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
      input.value = 'gizmo';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(input.value).toBe('gizmo');
      expect(bodyRows(fixture)).toHaveLength(3); // debounced — not yet applied

      jest.advanceTimersByTime(300);
      fixture.detectChanges();

      expect(bodyRows(fixture)).toHaveLength(1);
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Gizmo');
    });

    it('the <input> itself reflects every keystroke immediately, even before the debounce commits', () => {
      const fixture = create((h) => (h.filterable = true));
      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
      input.value = 'giz';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(input.value).toBe('giz');
      jest.advanceTimersByTime(300);
    });

    it('globalFilterFields narrows which columns participate in the global search', () => {
      const fixture = create((h) => {
        h.filterable = true;
        h.globalFilterFields = ['name'];
      });
      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
      input.value = '30'; // matches Widget's price, but price is excluded from the search fields
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      jest.advanceTimersByTime(300);
      fixture.detectChanges();

      expect(bodyRows(fixture)[0]?.textContent).toContain('No results found');
    });

    it('emits filter with the resulting filtered data once the debounce commits', () => {
      const fixture = create((h) => (h.filterable = true));
      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
      input.value = 'gizmo';
      input.dispatchEvent(new Event('input'));
      jest.advanceTimersByTime(300);

      expect(fixture.componentInstance.onFilter).toHaveBeenCalledWith({ value: 'gizmo', data: [PRODUCTS[2]] });
    });
  });

  describe('pagination', () => {
    // DAT-005.S1
    it('slices sortedValue to the current page', () => {
      const fixture = create((h) => {
        h.paginator = true;
        h.rows = 2;
      });
      expect(bodyRows(fixture)).toHaveLength(2);

      const nextPageButton = fixture.nativeElement.querySelector('button[aria-label="Page 2"]') as HTMLButtonElement;
      nextPageButton.click();
      fixture.detectChanges();

      expect(bodyRows(fixture)).toHaveLength(1);
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Gizmo');
    });

    // DAT-005.S2
    it('DAT-005.S2: setting first from the host shows the page that contains it', () => {
      const fixture = create((h) => {
        h.paginator = true;
        h.rows = 2;
      });
      fixture.componentInstance.first.set(2);
      fixture.detectChanges();

      expect(bodyRows(fixture).map((r) => cellText(r)[0])).toEqual(['Gizmo']);
      const current = fixture.nativeElement.querySelector('button[aria-current="page"]') as HTMLButtonElement;
      expect(current.getAttribute('aria-label')).toBe('Page 2');
    });

    // DAT-005.S3
    it('DAT-005.S3: a page change by the user writes the new first back to the host', () => {
      const fixture = create((h) => {
        h.paginator = true;
        h.rows = 2;
      });
      (fixture.nativeElement.querySelector('button[aria-label="Page 2"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.first()).toBe(2);
    });
  });

  describe('single selection', () => {
    it('clicking a row selects it, marking aria-selected and highlighting it', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      bodyRows(fixture)[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selection).toBe(PRODUCTS[1]);
      expect(bodyRows(fixture)[1].getAttribute('aria-selected')).toBe('true');
      expect(bodyRows(fixture)[0].getAttribute('aria-selected')).toBe('false');
    });

    it('clicking the already-selected row again is a no-op (radio semantics, no toggle-off)', () => {
      const fixture = create((h) => {
        h.selectionMode = 'single';
        h.selection = PRODUCTS[0];
      });
      bodyRows(fixture)[0].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBe(PRODUCTS[0]);
    });

    it('Enter on a focused row selects it', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const row = bodyRows(fixture)[2];
      expect(row.getAttribute('tabindex')).toBe('0');
      row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBe(PRODUCTS[2]);
    });

    it('Space on a focused row selects it (Wave 2 fix — 2026-08-19: was source-only, untested)', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const row = bodyRows(fixture)[2];
      row.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBe(PRODUCTS[2]);
    });

    it('rows have no tabindex at all when selection is not enabled', () => {
      const fixture = create();
      expect(bodyRows(fixture)[0].hasAttribute('tabindex')).toBe(false);
    });
  });

  describe('radio selection', () => {
    function radios(fixture: { nativeElement: HTMLElement }): HTMLInputElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('tbody input[type="radio"]'));
    }

    // DAT-006.S3
    it('DAT-006.S3: choosing a row radio selects the row, checks only that radio and emits rowSelect once', () => {
      const fixture = create((h) => (h.selectionMode = 'radio'));
      const inputs = radios(fixture);
      expect(inputs).toHaveLength(PRODUCTS.length);

      inputs[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selection).toBe(PRODUCTS[1]);
      expect(radios(fixture).map((r) => r.checked)).toEqual([false, true, false]);
      expect(bodyRows(fixture)[1].getAttribute('aria-selected')).toBe('true');
      expect(fixture.componentInstance.onRowSelect).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.onRowSelect).toHaveBeenCalledWith(PRODUCTS[1]);
    });

    // DAT-006.S3
    it('DAT-006.S3: the checked radio follows an external selection', () => {
      const fixture = create((h) => {
        h.selectionMode = 'radio';
        h.selection = PRODUCTS[2];
      });
      expect(radios(fixture).map((r) => r.checked)).toEqual([false, false, true]);
    });

    // DAT-006.S3
    it('DAT-006.S3: renders no select-all control and an empty header cell for the radio column', () => {
      const fixture = create((h) => (h.selectionMode = 'radio'));
      expect(fixture.nativeElement.querySelector('thead input')).toBeNull();
      const cells = headerCells(fixture);
      expect(cells).toHaveLength(4);
      expect(cells[0].textContent?.trim()).toBe('');
    });

    // DAT-006.S3
    it('DAT-006.S3: the radio column is counted in the empty-state colspan', () => {
      const fixture = create((h) => {
        h.selectionMode = 'radio';
        h.products = [];
      });
      expect(bodyRows(fixture)[0].querySelector('td')!.getAttribute('colspan')).toBe('4');
    });

    // DAT-006.S3
    it('DAT-006.S3: keeps the single-mode behavior: row click selects, re-click is a no-op, rows are focusable', () => {
      const fixture = create((h) => (h.selectionMode = 'radio'));
      expect(bodyRows(fixture)[0].getAttribute('tabindex')).toBe('0');

      bodyRows(fixture)[0].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBe(PRODUCTS[0]);
      expect(radios(fixture)[0].checked).toBe(true);

      bodyRows(fixture)[0].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.onRowSelect).toHaveBeenCalledTimes(1);
    });

    // DAT-006.S3
    it('DAT-006.S3: gives each radio an accessible name and a shared group name', () => {
      const fixture = create((h) => (h.selectionMode = 'radio'));
      const inputs = radios(fixture);
      expect(inputs.every((r) => !!r.getAttribute('aria-label'))).toBe(true);
      expect(new Set(inputs.map((r) => r.name)).size).toBe(1);
    });
  });

  describe('row keyboard navigation', () => {
    function attached(configure: (h: HostComponent) => void) {
      const fixture = create(configure);
      document.body.appendChild(fixture.nativeElement);
      return fixture;
    }

    function press(row: HTMLElement, key: string): KeyboardEvent {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      row.dispatchEvent(event);
      return event;
    }

    afterEach(() => {
      document.body.innerHTML = '';
    });

    // DAT-026.S1
    it('DAT-026.S1: ArrowDown moves focus to the next row and keeps the selection', () => {
      const fixture = attached((h) => {
        h.selectionMode = 'single';
        h.selection = PRODUCTS[0];
      });
      const rows = bodyRows(fixture);
      rows[1].focus();

      const event = press(rows[1], 'ArrowDown');
      fixture.detectChanges();

      expect(document.activeElement).toBe(rows[2]);
      expect(event.defaultPrevented).toBe(true);
      expect(fixture.componentInstance.selection).toBe(PRODUCTS[0]);
      expect(fixture.componentInstance.onRowSelect).not.toHaveBeenCalled();
    });

    // DAT-026.S1
    it('DAT-026.S1: ArrowUp moves focus to the previous row', () => {
      const fixture = attached((h) => (h.selectionMode = 'single'));
      const rows = bodyRows(fixture);
      rows[2].focus();
      press(rows[2], 'ArrowUp');
      expect(document.activeElement).toBe(rows[1]);
      expect(fixture.componentInstance.selection).toBeNull();
    });

    // DAT-026.S2
    it('DAT-026.S2: Home then End move focus to the first then the last row in radio mode', () => {
      const fixture = attached((h) => (h.selectionMode = 'radio'));
      const rows = bodyRows(fixture);
      rows[1].focus();

      press(rows[1], 'Home');
      expect(document.activeElement).toBe(rows[0]);

      press(rows[0], 'End');
      expect(document.activeElement).toBe(rows[2]);
      expect(fixture.componentInstance.selection).toBeNull();
    });

    // DAT-026.S3
    it('DAT-026.S3: ArrowUp on the first row and ArrowDown on the last row keep focus in place, without wrapping', () => {
      const fixture = attached((h) => (h.selectionMode = 'single'));
      const rows = bodyRows(fixture);
      rows[0].focus();
      press(rows[0], 'ArrowUp');
      expect(document.activeElement).toBe(rows[0]);

      rows[2].focus();
      press(rows[2], 'ArrowDown');
      expect(document.activeElement).toBe(rows[2]);
    });

    // DAT-026.S3
    it('DAT-026.S3: a table without a selection mode does not handle the keys', () => {
      const fixture = attached((h) => (h.selectionMode = null));
      const rows = bodyRows(fixture);
      rows[0].focus();
      const event = press(rows[0], 'ArrowDown');
      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).not.toBe(rows[1]);
    });

    // DAT-026.S4
    it('DAT-026.S4: in multiple mode the arrows, End and Home move focus and keep the selection', () => {
      const fixture = attached((h) => {
        h.selectionMode = 'multiple';
        h.selection = [PRODUCTS[0], PRODUCTS[1]];
      });
      const rows = bodyRows(fixture);
      expect(rows[1].getAttribute('tabindex')).toBe('0');
      rows[1].focus();

      const down = press(rows[1], 'ArrowDown');
      expect(document.activeElement).toBe(rows[2]);
      expect(down.defaultPrevented).toBe(true);

      press(rows[2], 'ArrowDown');
      expect(document.activeElement).toBe(rows[2]);

      press(rows[2], 'Home');
      expect(document.activeElement).toBe(rows[0]);

      press(rows[0], 'End');
      expect(document.activeElement).toBe(rows[2]);

      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([PRODUCTS[0], PRODUCTS[1]]);
      expect(fixture.componentInstance.onRowSelect).not.toHaveBeenCalled();
    });

    // DAT-026.S5
    it('DAT-026.S5: in multiple mode Space adds the focused row and Enter removes it again', () => {
      const fixture = attached((h) => (h.selectionMode = 'multiple'));
      const rows = bodyRows(fixture);
      rows[1].focus();

      const space = press(rows[1], ' ');
      fixture.detectChanges();
      expect(space.defaultPrevented).toBe(true);
      expect(fixture.componentInstance.selection).toEqual([PRODUCTS[1]]);

      press(bodyRows(fixture)[1], 'Enter');
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([]);
    });

    // DAT-026.S5
    it('DAT-026.S5: in multiple mode keys pressed on the row checkbox are left to the checkbox, which toggles the row once', () => {
      const fixture = attached((h) => (h.selectionMode = 'multiple'));
      const rows = bodyRows(fixture);
      const checkbox = rows[1].querySelector('input[type="checkbox"]') as HTMLInputElement;
      checkbox.focus();

      const space = press(checkbox, ' ');
      const arrow = press(checkbox, 'ArrowDown');
      fixture.detectChanges();

      expect(space.defaultPrevented).toBe(false);
      expect(arrow.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(checkbox);
      expect(fixture.componentInstance.selection).toBeNull();

      checkbox.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([PRODUCTS[1]]);
    });

    // DAT-026.S1
    it('DAT-026.S1: skips group header rows and moves between data rows only', () => {
      const grouped = [
        { name: 'Widget', price: 30, stock: 5, category: 'Hardware' },
        { name: 'Gadget', price: 10, stock: 0, category: 'Hardware' },
        { name: 'Gizmo', price: 20, stock: 12, category: 'Software' },
      ];
      const fixture = attached((h) => {
        h.products = grouped;
        h.selectionMode = 'single';
        h.rowGroupMode = 'subheader';
        h.groupRowsBy = 'category';
      });
      const dataRows = bodyRows(fixture).filter((tr) => tr.hasAttribute('tabindex'));
      expect(dataRows).toHaveLength(3);
      dataRows[1].focus();
      press(dataRows[1], 'ArrowDown');
      expect(document.activeElement).toBe(dataRows[2]);
    });
  });

  describe('multiple selection', () => {
    function checkbox(row: HTMLElement): HTMLInputElement {
      return row.querySelector('input[type="checkbox"]') as HTMLInputElement;
    }

    it('toggling a row checkbox adds/removes it from the selection array', () => {
      const fixture = create((h) => (h.selectionMode = 'multiple'));
      const cb = checkbox(bodyRows(fixture)[0]);
      cb.checked = true;
      cb.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([PRODUCTS[0]]);

      cb.checked = false;
      cb.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([]);
    });

    // DAT-006.S1
    it('DAT-006.S1: the header select-all checkbox selects/deselects every row', () => {
      const fixture = create((h) => (h.selectionMode = 'multiple'));
      const headerCheckbox = headerCells(fixture)[0].querySelector('input[type="checkbox"]') as HTMLInputElement;

      headerCheckbox.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual(PRODUCTS);

      headerCheckbox.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([]);
    });

    it('the header checkbox reflects a partial selection as indeterminate', () => {
      const fixture = create((h) => {
        h.selectionMode = 'multiple';
        h.selection = [PRODUCTS[0]];
      });
      const headerCheckbox = headerCells(fixture)[0].querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(headerCheckbox.indeterminate).toBe(true);
      expect(headerCheckbox.checked).toBe(false);
    });

    // Regression: the decorative box has no native `indeterminate` styling of
    // its own (unlike a real <input>'s :indeterminate pseudo-class) — without
    // a distinct icon, "all selected" (checked) and "some selected"
    // (indeterminate) would render as the exact same solid-filled box.
    it('renders a dash icon for indeterminate and a checkmark for fully checked, not the same visual', () => {
      const partial = create((h) => {
        h.selectionMode = 'multiple';
        h.selection = [PRODUCTS[0]];
      });
      const partialIcon = partial.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
      expect(partialIcon.name()).toBe('minus');

      const full = create((h) => {
        h.selectionMode = 'multiple';
        h.selection = [...PRODUCTS];
      });
      const fullIcon = full.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
      expect(fullIcon.name()).toBe('check');
    });

    it('clicking a row checkbox does not also fire the row-level single-select handler', () => {
      // Regression: without stopPropagation on the checkbox's own click, the row's
      // click handler would also run — harmless in multiple mode today (it's a no-op
      // there), but guards against the interaction wiring silently changing later.
      const fixture = create((h) => (h.selectionMode = 'multiple'));
      const cb = checkbox(bodyRows(fixture)[0]);
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
      cb.dispatchEvent(clickEvent);
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  it('renders no selection UI at all when selectionMode is null', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-selected]')).toBeNull();
  });

  describe('loading', () => {
    it('renders no overlay by default', () => {
      const fixture = create();
      expect(fixture.nativeElement.querySelector('med-progress-spinner')).toBeNull();
    });

    it('dims the table and overlays a spinner when true, without removing the existing rows', () => {
      const fixture = create((h) => (h.loading = true));
      expect(fixture.nativeElement.querySelector('med-progress-spinner')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('table')?.className).toContain('opacity-50');
      expect(bodyRows(fixture)).toHaveLength(3); // rows stay in place underneath
    });
  });

  describe('sortMode: multiple', () => {
    it('a plain click replaces the whole multi-sort with just that column', () => {
      const fixture = create((h) => {
        h.sortMode = 'multiple';
        h.multiSortMeta = [
          { field: 'price', order: 'asc' },
          { field: 'stock', order: 'asc' },
        ];
      });
      headerCells(fixture)[0].click(); // Name, plain click
      fixture.detectChanges();
      expect(fixture.componentInstance.multiSortMeta).toEqual([{ field: 'name', order: 'asc' }]);
    });

    it('Shift+click adds a column to the existing multi-sort, keeping the others', () => {
      const fixture = create((h) => {
        h.sortMode = 'multiple';
        h.multiSortMeta = [{ field: 'price', order: 'asc' }];
      });
      headerCells(fixture)[0].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
      fixture.detectChanges();
      expect(fixture.componentInstance.multiSortMeta).toEqual([
        { field: 'price', order: 'asc' },
        { field: 'name', order: 'asc' },
      ]);
    });

    it('sorts by the first key, breaking ties with the second', () => {
      const fixture = create((h) => {
        h.products = [
          { name: 'B', price: 10, stock: 1 },
          { name: 'A', price: 10, stock: 2 },
          { name: 'C', price: 5, stock: 3 },
        ];
        h.sortMode = 'multiple';
        h.multiSortMeta = [
          { field: 'price', order: 'asc' },
          { field: 'name', order: 'asc' },
        ];
      });
      const names = bodyRows(fixture).map((row) => cellText(row)[0]);
      expect(names).toEqual(['C', 'A', 'B']); // price 5 first, then price-10 rows tie-broken by name
    });

    it('Shift+click on an already-included column cycles its order in place, then removes it once it reaches none', () => {
      const fixture = create((h) => {
        h.sortMode = 'multiple';
        h.multiSortMeta = [
          { field: 'name', order: 'asc' },
          { field: 'price', order: 'asc' },
        ];
      });
      const shiftClick = () => headerCells(fixture)[1].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));

      shiftClick(); // price: asc -> desc, same position
      fixture.detectChanges();
      expect(fixture.componentInstance.multiSortMeta).toEqual([
        { field: 'name', order: 'asc' },
        { field: 'price', order: 'desc' },
      ]);

      shiftClick(); // price: desc -> none, removed entirely
      fixture.detectChanges();
      expect(fixture.componentInstance.multiSortMeta).toEqual([{ field: 'name', order: 'asc' }]);
    });

    it('shows a 1-based priority badge next to each active multi-sort column', () => {
      const fixture = create((h) => {
        h.sortMode = 'multiple';
        h.multiSortMeta = [
          { field: 'price', order: 'asc' },
          { field: 'name', order: 'asc' },
        ];
      });
      expect(headerCells(fixture)[0].querySelector('sup')?.textContent).toBe('2'); // Name
      expect(headerCells(fixture)[1].querySelector('sup')?.textContent).toBe('1'); // Price
    });
  });

  describe('lazy', () => {
    it('does not filter/sort/paginate client-side — value() is trusted as already being the current page', () => {
      const fixture = create((h) => {
        h.lazy = true;
        h.paginator = true;
        h.rows = 1;
        h.products = [PRODUCTS[1]]; // server already returned just this page
      });
      expect(bodyRows(fixture)).toHaveLength(1);
      expect(cellText(bodyRows(fixture)[0])[0]).toBe('Gadget');
    });

    it('the paginator uses totalRecords, not value().length', () => {
      const fixture = create((h) => {
        h.lazy = true;
        h.paginator = true;
        h.rows = 1;
        h.products = [PRODUCTS[0]];
        h.totalRecords = 50;
      });
      expect(fixture.nativeElement.textContent).toContain('50');
    });

    // DAT-007.S1
    it('DAT-007.S1: emits lazyLoad once on init, and again whenever page/sort/filter changes', () => {
      const fixture = create((h) => {
        h.lazy = true;
        h.paginator = true;
        h.totalRecords = 30;
      });
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledWith({
        first: 0,
        rows: 10,
        sortField: null,
        sortOrder: null,
        multiSortMeta: [],
        filter: '',
        columnFilters: {},
      });

      headerCells(fixture)[0].click(); // sort by Name
      fixture.detectChanges();
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenLastCalledWith(expect.objectContaining({ sortField: 'name', sortOrder: 'asc' }));

      (fixture.nativeElement.querySelector('button[aria-label="Next page"]') as HTMLButtonElement).click(); // change the page
      fixture.detectChanges();
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledTimes(3);
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenLastCalledWith(expect.objectContaining({ first: 10, rows: 10, sortField: 'name', sortOrder: 'asc' }));
    });

    it('never emits lazyLoad when lazy is off', () => {
      const fixture = create();
      expect(fixture.componentInstance.onLazyLoad).not.toHaveBeenCalled();
    });
  });

  describe('editMode: cell', () => {
    function editInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement | null {
      return fixture.nativeElement.querySelector('input.edit-input');
    }

    it('does not enter edit mode on a plain click', () => {
      const fixture = create((h) => (h.editMode = 'cell'));
      bodyRows(fixture)[0].querySelectorAll('td')[0].click();
      fixture.detectChanges();
      expect(editInput(fixture)).toBeNull();
    });

    it('double-clicking an editable cell shows its edit template with the row bound', () => {
      const fixture = create((h) => (h.editMode = 'cell'));
      const nameCell = bodyRows(fixture)[0].querySelectorAll('td')[0];
      nameCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();

      const input = editInput(fixture);
      expect(input).not.toBeNull();
      expect(input!.value).toBe('Widget');
    });

    it('double-clicking a non-editable column cell does nothing', () => {
      const fixture = create((h) => (h.editMode = 'cell'));
      const priceCell = bodyRows(fixture)[0].querySelectorAll('td')[1];
      priceCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();
      expect(editInput(fixture)).toBeNull();
    });

    it('DAT-008.S1: Enter in the edit template commits editComplete with the new value and exits edit mode', () => {
      const fixture = create((h) => (h.editMode = 'cell'));
      bodyRows(fixture)[0].querySelectorAll('td')[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();

      const input = editInput(fixture)!;
      input.value = 'Widget Pro';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(fixture.componentInstance.onEditComplete).toHaveBeenCalledWith({ row: PRODUCTS[0], field: 'name', value: 'Widget Pro' });
      expect(editInput(fixture)).toBeNull();
    });

    it('Escape in the edit template cancels without committing', () => {
      const fixture = create((h) => (h.editMode = 'cell'));
      bodyRows(fixture)[0].querySelectorAll('td')[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();

      editInput(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(fixture.componentInstance.onEditComplete).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onEditCancel).toHaveBeenCalledWith({ row: PRODUCTS[0], field: 'name' });
      expect(editInput(fixture)).toBeNull();
    });

    it('only one cell is ever in edit mode at a time', () => {
      const fixture = create((h) => (h.editMode = 'cell'));
      bodyRows(fixture)[0].querySelectorAll('td')[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();
      bodyRows(fixture)[1].querySelectorAll('td')[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('input.edit-input')).toHaveLength(1);
      expect((editInput(fixture) as HTMLInputElement).value).toBe('Gadget');
    });

    it('does nothing when editMode is not set, even for an editable column', () => {
      const fixture = create();
      bodyRows(fixture)[0].querySelectorAll('td')[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();
      expect(editInput(fixture)).toBeNull();
    });
  });

  describe('exportCSV', () => {
    function dataTable(fixture: { debugElement: DebugElement }): DataTableComponent<Product> {
      return fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance;
    }

    // jsdom's Blob shim in this environment doesn't implement .text() (even
    // though it exists elsewhere) — mocking the Blob constructor to just
    // capture the exact CSV string passed into `new Blob([csv], ...)`
    // sidesteps that entirely instead of depending on any Blob instance API
    // (a mocked constructor that returns a plain object also sidesteps
    // "Class constructor Blob cannot be invoked without 'new'", which a bare
    // jest.spyOn() with no replacement implementation runs into here).
    function exportedCsv(fixture: ReturnType<typeof create>, options?: { selectionOnly?: boolean }): string {
      let capturedCsv = '';
      const spy = jest.spyOn(globalThis, 'Blob' as never).mockImplementation(((parts: string[]) => {
        capturedCsv = parts[0];
        return {} as Blob;
      }) as never);
      dataTable(fixture).exportCSV(options);
      spy.mockRestore();
      return capturedCsv;
    }

    it('exports every row as CSV, header first', () => {
      const fixture = create();
      const csv = exportedCsv(fixture);
      expect(csv).toBe('Name,Price,Stock\nWidget,30,5\nGadget,10,0\nGizmo,20,12');
    });

    it('exports sortedValue (respects the current sort), not the original row order', () => {
      const fixture = create();
      headerCells(fixture)[1].click(); // sort by Price, ascending
      fixture.detectChanges();
      const csv = exportedCsv(fixture);
      expect(csv.split('\n')[1]).toBe('Gadget,10,0');
    });

    // DAT-009.S1
    it('quotes a value containing the separator, a quote, or a newline, doubling internal quotes', () => {
      const fixture = create((h) => (h.products = [{ name: 'Widget, "Pro"', price: 30, stock: 5 }]));
      const csv = exportedCsv(fixture);
      expect(csv.split('\n')[1]).toBe('"Widget, ""Pro"""' + ',30,5');
    });

    it('{ selectionOnly: true } exports only the selected rows', () => {
      const fixture = create((h) => {
        h.selectionMode = 'multiple';
        h.selection = [PRODUCTS[0], PRODUCTS[2]];
      });
      const csv = exportedCsv(fixture, { selectionOnly: true });
      expect(csv).toBe('Name,Price,Stock\nWidget,30,5\nGizmo,20,12');
    });

    it('{ selectionOnly: true } exports nothing but the header when there is no selection', () => {
      const fixture = create();
      const csv = exportedCsv(fixture, { selectionOnly: true });
      expect(csv).toBe('Name,Price,Stock');
    });

    it('triggers a real download via a temporary <a download> click', () => {
      const fixture = create();
      const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      dataTable(fixture).exportCSV();
      expect(clickSpy).toHaveBeenCalledTimes(1);
      clickSpy.mockRestore();
    });
  });

  describe('rowsPerPageOptions', () => {
    it('forwards through to the embedded paginator', () => {
      const fixture = create((h) => {
        h.paginator = true;
        h.rowsPerPageOptions = [5, 10, 25];
      });
      const select = fixture.nativeElement.querySelector('med-paginator select');
      expect(select).not.toBeNull();
      const optionValues = Array.from(select!.querySelectorAll('option')).map((o) => (o as HTMLOptionElement).value);
      expect(optionValues).toEqual(['5', '10', '25']);
    });

    // DAT-005.S4
    it('DAT-005.S4: picking a larger page size shows that many rows and returns to the first page', () => {
      const fixture = create((h) => {
        h.paginator = true;
        h.rows = 1;
        h.rowsPerPageOptions = [1, 2, 3];
      });
      fixture.componentInstance.first.set(2);
      fixture.detectChanges();
      expect(bodyRows(fixture)).toHaveLength(1);
      const before = fixture.nativeElement.querySelector('button[aria-current="page"]') as HTMLButtonElement;
      expect(before.getAttribute('aria-label')).toBe('Page 3');

      const select = fixture.nativeElement.querySelector('med-paginator select') as HTMLSelectElement;
      select.value = '3';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(bodyRows(fixture)).toHaveLength(Math.min(3, PRODUCTS.length));
      expect(fixture.componentInstance.first()).toBe(0);
      const current = fixture.nativeElement.querySelector('button[aria-current="page"]') as HTMLButtonElement;
      expect(current.getAttribute('aria-label')).toBe('Page 1');
    });

    it('in lazy mode, picking a page size emits lazyLoad with the new rows', () => {
      const fixture = create((h) => {
        h.lazy = true;
        h.paginator = true;
        h.rows = 5;
        h.rowsPerPageOptions = [5, 10];
        h.totalRecords = 83;
      });

      const select = fixture.nativeElement.querySelector('med-paginator select') as HTMLSelectElement;
      select.value = '10';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(fixture.componentInstance.onLazyLoad).toHaveBeenLastCalledWith(expect.objectContaining({ first: 0, rows: 10 }));
    });
  });

  describe('dataKey', () => {
    // A fresh array of otherwise-equal-by-value objects, distinct references
    // from PRODUCTS — the exact scenario dataKey exists to fix (e.g. a
    // re-fetched page, or a lazy reload that hands back new instances).
    function freshCopy(): Product[] {
      return PRODUCTS.map((p) => ({ ...p }));
    }

    it('without dataKey, selection by reference misses an equal-by-value-but-different-reference row', () => {
      const fixture = create((h) => {
        h.selectionMode = 'single';
        h.products = freshCopy();
        h.selection = PRODUCTS[1]; // the OLD reference, not the new array's object
      });
      expect(bodyRows(fixture).some((row) => row.getAttribute('aria-selected') === 'true')).toBe(false);
    });

    // DAT-006.S2
    it('DAT-006.S2: with dataKey, selection matches by key value across different references', () => {
      const fixture = create((h) => {
        h.selectionMode = 'single';
        h.dataKey = 'name';
        h.products = freshCopy();
        h.selection = PRODUCTS[1]; // old reference, same name
      });
      expect(bodyRows(fixture)[1].getAttribute('aria-selected')).toBe('true');
    });

    // DAT-006.S2
    it('DAT-006.S2: with dataKey, multiple-mode selection matches a different reference sharing the same key', () => {
      const fixture = create((h) => {
        h.selectionMode = 'multiple';
        h.dataKey = 'name';
        h.products = freshCopy();
        h.selection = [PRODUCTS[1]]; // old reference, same name ("Gadget")
      });
      const cb = bodyRows(fixture)[1].querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(cb.checked).toBe(true);
    });
  });

  describe('rich events: rowSelect / rowUnselect / sort', () => {
    it('rowSelect fires when a row is selected (single mode), not on the already-selected no-op', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      bodyRows(fixture)[1].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.onRowSelect).toHaveBeenCalledWith(PRODUCTS[1]);

      fixture.componentInstance.onRowSelect.mockClear();
      bodyRows(fixture)[1].click(); // already selected — no-op
      fixture.detectChanges();
      expect(fixture.componentInstance.onRowSelect).not.toHaveBeenCalled();
    });

    it('rowSelect/rowUnselect fire when checking/unchecking a row (multiple mode)', () => {
      const fixture = create((h) => (h.selectionMode = 'multiple'));
      const cb = bodyRows(fixture)[0].querySelector('input[type="checkbox"]') as HTMLInputElement;

      cb.checked = true;
      cb.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.componentInstance.onRowSelect).toHaveBeenCalledWith(PRODUCTS[0]);

      cb.checked = false;
      cb.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.componentInstance.onRowUnselect).toHaveBeenCalledWith(PRODUCTS[0]);
    });

    it('sort fires with the resulting metadata and sorted data', () => {
      const fixture = create();
      headerCells(fixture)[1].click(); // Price, ascending
      fixture.detectChanges();
      expect(fixture.componentInstance.onSort).toHaveBeenCalledWith({
        field: 'price',
        order: 'asc',
        multiSortMeta: [],
        data: [PRODUCTS[1], PRODUCTS[2], PRODUCTS[0]],
      });
    });

    it('sort fires in sortMode: multiple too, with the resulting multiSortMeta and data', () => {
      const fixture = create((h) => (h.sortMode = 'multiple'));
      headerCells(fixture)[1].click(); // Price, plain click
      fixture.detectChanges();
      expect(fixture.componentInstance.onSort).toHaveBeenCalledWith({
        field: null,
        order: null,
        multiSortMeta: [{ field: 'price', order: 'asc' }],
        data: [PRODUCTS[1], PRODUCTS[2], PRODUCTS[0]],
      });
    });
  });

  describe('row grouping (rowGroupMode: subheader)', () => {
    const GROUPED: (Product & { category: string })[] = [
      { name: 'Widget', price: 30, stock: 5, category: 'Hardware' },
      { name: 'Gadget', price: 10, stock: 0, category: 'Hardware' },
      { name: 'Gizmo', price: 20, stock: 12, category: 'Software' },
    ];

    function isSubheaderRow(tr: HTMLElement): boolean {
      const tds = tr.querySelectorAll('td');
      return tds.length === 1 && tds[0].hasAttribute('colspan');
    }

    it('renders no subheader rows when rowGroupMode is unset', () => {
      const fixture = create((h) => (h.products = GROUPED));
      expect(bodyRows(fixture).filter(isSubheaderRow)).toHaveLength(0);
    });

    it('renders one subheader per distinct consecutive group value, printing the group value by default', () => {
      const fixture = create((h) => {
        h.products = GROUPED;
        h.rowGroupMode = 'subheader';
        h.groupRowsBy = 'category';
      });
      const rows = bodyRows(fixture);
      const subheaders = rows.filter(isSubheaderRow).map((tr) => tr.textContent?.trim());
      expect(subheaders).toEqual(['Hardware', 'Software']);
    });

    it('groupRowsBy becomes the primary sort key, keeping same-group rows contiguous', () => {
      const scattered: (Product & { category: string })[] = [
        { name: 'Widget', price: 30, stock: 5, category: 'Hardware' },
        { name: 'Gizmo', price: 20, stock: 12, category: 'Software' },
        { name: 'Gadget', price: 10, stock: 0, category: 'Hardware' }, // same group as Widget, not adjacent in source order
      ];
      const fixture = create((h) => {
        h.products = scattered;
        h.rowGroupMode = 'subheader';
        h.groupRowsBy = 'category';
      });
      const names = bodyRows(fixture)
        .filter((row) => !isSubheaderRow(row))
        .map((row) => cellText(row)[0]);
      expect(names).toEqual(['Widget', 'Gadget', 'Gizmo']); // both Hardware rows grouped together
    });

    it('colspan on the subheader row spans every data column', () => {
      const fixture = create((h) => {
        h.products = GROUPED;
        h.rowGroupMode = 'subheader';
        h.groupRowsBy = 'category';
      });
      const subheader = bodyRows(fixture).find(isSubheaderRow)!;
      expect(subheader.querySelector('td')!.getAttribute('colspan')).toBe('3');
    });
  });

  describe('reorderable (drag-and-drop row reorder)', () => {
    function dragEvent(type: string): DragEvent {
      return new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
    }

    it('does not render a drag handle column by default', () => {
      const fixture = create();
      expect(fixture.nativeElement.querySelector('td.cursor-move')).toBeNull();
    });

    it('renders a drag handle in each row when enabled', () => {
      const fixture = create((h) => (h.reorderable = true));
      expect(fixture.nativeElement.querySelectorAll('td.cursor-move')).toHaveLength(3);
    });

    it('dragging row 0 onto row 2 emits rowReorder with indices into value(), not the display position', () => {
      const fixture = create((h) => (h.reorderable = true));
      const rows = bodyRows(fixture);
      rows[0].dispatchEvent(dragEvent('dragstart'));
      rows[2].dispatchEvent(dragEvent('dragover'));
      rows[2].dispatchEvent(dragEvent('drop'));
      fixture.detectChanges();
      expect(fixture.componentInstance.onRowReorder).toHaveBeenCalledWith({ dragIndex: 0, dropIndex: 2 });
    });

    it('dropping on the same row as the drag origin does nothing', () => {
      const fixture = create((h) => (h.reorderable = true));
      const rows = bodyRows(fixture);
      rows[1].dispatchEvent(dragEvent('dragstart'));
      rows[1].dispatchEvent(dragEvent('drop'));
      expect(fixture.componentInstance.onRowReorder).not.toHaveBeenCalled();
    });

    // DAT-010.S1
    it('DAT-010.S1: indices refer to value() order, not the currently sorted/displayed order', () => {
      const fixture = create((h) => (h.reorderable = true));
      headerCells(fixture)[1].click(); // sort by Price ascending: Gadget(10), Gizmo(20), Widget(30)
      fixture.detectChanges();

      const rows = bodyRows(fixture);
      rows[0].dispatchEvent(dragEvent('dragstart')); // displayed first: Gadget, index 1 in value()
      rows[1].dispatchEvent(dragEvent('dragover')); // displayed second: Gizmo, index 2 in value()
      rows[1].dispatchEvent(dragEvent('drop'));
      fixture.detectChanges();
      expect(fixture.componentInstance.onRowReorder).toHaveBeenCalledWith({ dragIndex: 1, dropIndex: 2 });
    });
  });

  // @scenario UI-008.S1
  describe('resizableColumns, rowExpansion, stateKey/stateStorage and scrollable (Wave 2)', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items"
          dataKey="id"
          [resizableColumns]="resizableColumns"
          [scrollable]="scrollable"
          [scrollHeight]="scrollHeight"
          [stateKey]="stateKey"
          [stateStorage]="stateStorage"
          [(expandedRowKeys)]="expandedRowKeys"
          [(sortField)]="sortField"
          [(sortOrder)]="sortOrder"
          (rowExpand)="expandedRows.push($event)"
          (rowCollapse)="collapsedRows.push($event)"
        >
          <med-table-column field="name" header="Name" [sortable]="true" />
          <med-table-column field="price" header="Price" [sortable]="true" />
          <ng-template #rowexpansion let-row>
            <div class="expanded-detail">Detail: {{ row.name }}</div>
          </ng-template>
        </med-data-table>
      `,
    })
    class Wave2DataTableHostComponent {
      items = [
        { id: '1', name: 'Widget', price: 30 },
        { id: '2', name: 'Gadget', price: 10 },
      ];
      resizableColumns = true;
      scrollable = true;
      scrollHeight = '200px';
      stateKey: string | null = 'dt-wave2-state';
      stateStorage: 'session' | 'local' = 'session';
      expandedRowKeys: Record<string, boolean> = {};
      sortField: string | null = null;
      sortOrder: 'asc' | 'desc' | null = null;
      expandedRows: unknown[] = [];
      collapsedRows: unknown[] = [];
    }

    beforeEach(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    it('renders column resize handles when resizableColumns is true and sticky thead when scrollable is true', () => {
      const fixture = TestBed.createComponent(Wave2DataTableHostComponent);
      fixture.detectChanges();

      // Default `fit` mode: every header but the last visible one has a handle (DAT-031.S3).
      const headerCount = fixture.nativeElement.querySelectorAll('thead th').length;
      expect(fixture.nativeElement.querySelectorAll('[data-col-resize-handle="true"]')).toHaveLength(headerCount - 1);
      const thead = fixture.nativeElement.querySelector('thead') as HTMLElement;
      expect(thead.className).toContain('sticky');
    });

    it('restores the stored sort after the first render and does not overwrite it with the defaults', () => {
      sessionStorage.setItem('dt-wave2-state', JSON.stringify({ first: 0, sortField: 'price', sortOrder: 'desc', expandedRowKeys: {} }));
      const fixture = TestBed.createComponent(Wave2DataTableHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();

      expect(fixture.componentInstance.sortField).toBe('price');
      expect(fixture.componentInstance.sortOrder).toBe('desc');
      expect(JSON.parse(sessionStorage.getItem('dt-wave2-state')!).sortField).toBe('price');
    });

    it('renders #rowexpansion template when expandedRowKeys has the row key and persists sort state', () => {
      const fixture = TestBed.createComponent(Wave2DataTableHostComponent);
      fixture.componentInstance.expandedRowKeys = { '1': true };
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.expanded-detail')?.textContent).toContain('Detail: Widget');

      const nameHeader = fixture.nativeElement.querySelector('thead th') as HTMLElement;
      nameHeader.click();
      fixture.detectChanges();

      const saved = JSON.parse(sessionStorage.getItem('dt-wave2-state')!);
      expect(saved.sortField).toBe('name');
      expect(saved.sortOrder).toBe('asc');
    });
  });

  describe('row identity and row labels', () => {
    interface Item {
      id: number;
      name: string;
    }

    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items()"
          [selectionMode]="selectionMode"
          [rowAriaLabel]="rowAriaLabel"
          [rowTrackBy]="rowTrackBy"
          [expandedRowKeys]="expandedRowKeys"
        >
          <med-table-column field="name" header="Name" />
          <ng-template #rowexpansion let-row>
            <div class="expanded-detail">Detail: {{ row.name }}</div>
          </ng-template>
        </med-data-table>
      `,
    })
    class RowIdentityHostComponent {
      items = signal<Item[]>([
        { id: 1, name: 'Widget' },
        { id: 2, name: 'Gadget' },
        { id: 3, name: 'Gizmo' },
      ]);
      selectionMode: 'multiple' | 'radio' | null = 'multiple';
      rowAriaLabel: ((row: Item) => string) | null = null;
      rowTrackBy: (row: Item, index: number) => unknown = (_row, index) => index;
      expandedRowKeys: Record<string, boolean> = {};
    }

    const byRowLabel = (row: Item) => `Select ${row.name}`;
    const byId = (row: Item) => row.id;

    function bodyControls(fixture: { nativeElement: HTMLElement }, type: 'checkbox' | 'radio'): HTMLInputElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll<HTMLInputElement>(`tbody input[type="${type}"]`));
    }

    function create() {
      const fixture = TestBed.createComponent(RowIdentityHostComponent);
      return fixture;
    }

    // DAT-027.S1
    it('DAT-027.S1: rowAriaLabel names the checkbox of each row', () => {
      const fixture = create();
      fixture.componentInstance.rowAriaLabel = byRowLabel;
      fixture.detectChanges();

      expect(bodyControls(fixture, 'checkbox').map((c) => c.getAttribute('aria-label'))).toEqual(['Select Widget', 'Select Gadget', 'Select Gizmo']);
    });

    // DAT-027.S2
    it('DAT-027.S2: without rowAriaLabel every checkbox and radio is named "Select row"', () => {
      const multiple = create();
      multiple.detectChanges();
      expect(bodyControls(multiple, 'checkbox').map((c) => c.getAttribute('aria-label'))).toEqual(['Select row', 'Select row', 'Select row']);

      const radio = create();
      radio.componentInstance.selectionMode = 'radio';
      radio.detectChanges();
      expect(bodyControls(radio, 'radio').map((c) => c.getAttribute('aria-label'))).toEqual(['Select row', 'Select row', 'Select row']);
    });

    // DAT-027.S3
    it('DAT-027.S3: rowAriaLabel names the radio of each row', () => {
      const fixture = create();
      fixture.componentInstance.selectionMode = 'radio';
      fixture.componentInstance.rowAriaLabel = byRowLabel;
      fixture.detectChanges();

      expect(bodyControls(fixture, 'radio').map((c) => c.getAttribute('aria-label'))).toEqual(['Select Widget', 'Select Gadget', 'Select Gizmo']);
    });

    // DAT-027.S4
    it('DAT-027.S4: rowTrackBy keeps each row element when value is replaced with new objects of the same ids', () => {
      const fixture = create();
      fixture.componentInstance.selectionMode = null;
      fixture.componentInstance.rowTrackBy = byId;
      fixture.detectChanges();
      const before = bodyRows(fixture);
      const elementOf = (id: number) => before[id - 1];

      fixture.componentInstance.items.set([
        { id: 3, name: 'Gizmo' },
        { id: 2, name: 'Gadget' },
        { id: 1, name: 'Widget' },
      ]);
      fixture.detectChanges();

      const after = bodyRows(fixture);
      expect(after.map((r) => cellText(r)[0])).toEqual(['Gizmo', 'Gadget', 'Widget']);
      // Ids 1 and 3 swap places, so index-based tracking would reuse the elements by position and fail here.
      expect(after[0]).toBe(elementOf(3));
      expect(after[1]).toBe(elementOf(2));
      expect(after[2]).toBe(elementOf(1));
    });

    // DAT-027.S4 (default): index identity
    it('DAT-027.S4: by default a row element is reused by position, not by record', () => {
      const fixture = create();
      fixture.componentInstance.selectionMode = null;
      fixture.detectChanges();
      const before = bodyRows(fixture);

      fixture.componentInstance.items.set([
        { id: 3, name: 'Gizmo' },
        { id: 2, name: 'Gadget' },
        { id: 1, name: 'Widget' },
      ]);
      fixture.detectChanges();

      const after = bodyRows(fixture);
      expect(after.map((r) => cellText(r)[0])).toEqual(['Gizmo', 'Gadget', 'Widget']);
      expect(after[0]).toBe(before[0]);
      expect(after[2]).toBe(before[2]);
    });

    // DAT-027.S5
    it('DAT-027.S5: without dataKey the expansion key is the rowTrackBy identity as text', () => {
      const fixture = create();
      fixture.componentInstance.selectionMode = null;
      fixture.componentInstance.rowTrackBy = byId;
      fixture.componentInstance.expandedRowKeys = { '2': true };
      fixture.componentInstance.items.set([
        { id: 3, name: 'Gizmo' },
        { id: 2, name: 'Gadget' },
        { id: 1, name: 'Widget' },
      ]);
      fixture.detectChanges();

      const details = Array.from(fixture.nativeElement.querySelectorAll('.expanded-detail')) as HTMLElement[];
      expect(details).toHaveLength(1);
      expect(details[0].textContent).toContain('Detail: Gadget');
    });
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" [selectionMode]="selectionMode" ariaLabel="Frozen">
      <med-table-column field="name" header="Name" [frozen]="firstFrozen" width="120px" />
      <med-table-column field="price" header="Price" [frozen]="secondFrozen" [alignFrozen]="priceAlign" width="100px" />
      <med-table-column field="stock" header="Stock" [frozen]="lastFrozen" alignFrozen="right" />
    </med-data-table>
  `,
})
class FrozenHostComponent {
  products: Product[] = PRODUCTS;
  selectionMode: 'single' | 'multiple' | 'radio' | null = null;
  firstFrozen = false;
  secondFrozen = false;
  priceAlign: 'left' | 'right' = 'left';
  lastFrozen = false;
}

describe('DataTableComponent frozen columns', () => {
  function create(setup: (host: FrozenHostComponent) => void) {
    TestBed.configureTestingModule({ imports: [FrozenHostComponent] });
    const fixture = TestBed.createComponent(FrozenHostComponent);
    setup(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  const headerCells = (fixture: ReturnType<typeof create>): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('thead th'));
  const firstRowCells = (fixture: ReturnType<typeof create>): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('tbody tr:first-child td'));

  // DAT-028.S3
  it('DAT-028.S3: several frozen columns stack, each offset by the widths before it', () => {
    const fixture = create((host) => {
      host.firstFrozen = true;
      host.secondFrozen = true;
    });

    for (const cells of [headerCells(fixture), firstRowCells(fixture)]) {
      expect(cells[0].style.position).toBe('sticky');
      expect(cells[0].style.left).toBe('0px');
      expect(cells[1].style.position).toBe('sticky');
      expect(cells[1].style.left).toBe('120px');
      expect(cells[2].style.position).not.toBe('sticky');
    }
  });

  // DAT-028.S3
  it('DAT-028.S3: a right-frozen column is offset from the right edge and a frozen column without a width counts 60px', () => {
    const fixture = create((host) => {
      host.lastFrozen = true;
    });

    expect(headerCells(fixture)[2].style.position).toBe('sticky');
    expect(headerCells(fixture)[2].style.right).toBe('0px');
    expect(firstRowCells(fixture)[2].style.right).toBe('0px');
  });

  // DAT-028.S3
  it('DAT-028.S3: right-frozen columns stack from the right edge and a width-less one adds 60px to the next offset', () => {
    const fixture = create((host) => {
      host.secondFrozen = true;
      host.priceAlign = 'right';
      host.lastFrozen = true;
    });

    for (const cells of [headerCells(fixture), firstRowCells(fixture)]) {
      expect(cells[2].style.right).toBe('0px');
      expect(cells[1].style.right).toBe('60px');
      expect(cells[1].style.position).toBe('sticky');
    }
  });

  // DAT-028.S4
  it('DAT-028.S4: a frozen column makes the table fixed-layout and gives frozen cells an opaque background', () => {
    const fixture = create((host) => {
      host.firstFrozen = true;
    });

    expect(fixture.nativeElement.querySelector('table').classList).toContain('table-fixed');
    expect(headerCells(fixture)[0].className).toMatch(/\bbg-surface-\d+/);
    expect(firstRowCells(fixture)[0].className).toMatch(/\bbg-surface-\d+/);
    expect(firstRowCells(fixture)[1].className).not.toMatch(/\bbg-surface-0\b/);
  });

  // DAT-028.S4
  it('DAT-028.S4: a table without a frozen column keeps the auto layout', () => {
    const fixture = create(() => undefined);

    expect(fixture.nativeElement.querySelector('table').classList).not.toContain('table-fixed');
  });

  // DAT-028.S5
  it('DAT-028.S5: the selection column sticks at offset 0 and the frozen data column is offset by its width', () => {
    const fixture = create((host) => {
      host.selectionMode = 'multiple';
      host.firstFrozen = true;
    });

    for (const cells of [headerCells(fixture), firstRowCells(fixture)]) {
      expect(cells[0].style.position).toBe('sticky');
      expect(cells[0].style.left).toBe('0px');
      expect(cells[0].style.width).toBe('40px');
      expect(cells[1].style.position).toBe('sticky');
      expect(cells[1].style.left).toBe('40px');
    }
  });

  // DAT-028.S6
  it('DAT-028.S6: the selection column is not sticky when only a right-frozen column exists', () => {
    const fixture = create((host) => {
      host.selectionMode = 'multiple';
      host.lastFrozen = true;
    });

    expect(headerCells(fixture)[0].style.position).not.toBe('sticky');
    expect(firstRowCells(fixture)[0].style.position).not.toBe('sticky');
  });
});

describe('DataTableComponent frozen rows', () => {
  const PINNED: Product[] = [{ name: 'Pinned', price: 99, stock: 1 }];
  const firstNames = (fixture: { nativeElement: HTMLElement }) => bodyRows(fixture).map((r) => cellText(r)[0]);

  // DAT-029.S1
  it('DAT-029.S1: frozen rows render before the rows from value', () => {
    const fixture = create((h) => (h.frozenValue = PINNED));
    expect(firstNames(fixture)).toEqual(['Pinned', 'Widget', 'Gadget', 'Gizmo']);
  });

  // DAT-029.S1
  it('DAT-029.S1: no frozen row renders when frozenValue is empty or not set', () => {
    expect(firstNames(create((h) => (h.frozenValue = [])))).toEqual(['Widget', 'Gadget', 'Gizmo']);
    expect(firstNames(create())).toEqual(['Widget', 'Gadget', 'Gizmo']);
  });

  // DAT-029.S2
  it('DAT-029.S2: frozen rows keep their order and stay visible through sort, filter and paging', () => {
    jest.useFakeTimers();
    const fixture = create((h) => {
      h.frozenValue = [PINNED[0], { name: 'Zeta', price: 1, stock: 1 }];
      h.paginator = true;
      h.rows = 2;
      h.filterable = true;
      h.sortField = 'price';
      h.sortOrder = 'asc';
    });
    expect(firstNames(fixture).slice(0, 2)).toEqual(['Pinned', 'Zeta']);

    (fixture.nativeElement.querySelector('button[aria-label="Page 2"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(firstNames(fixture).slice(0, 2)).toEqual(['Pinned', 'Zeta']);
    (fixture.nativeElement.querySelector('button[aria-label="Page 1"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'gizmo';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(firstNames(fixture)).toEqual(['Pinned', 'Zeta', 'Gizmo']);
    jest.useRealTimers();
  });

  // DAT-029.S4
  it('DAT-029.S4: clicking a frozen row selects nothing and does not emit rowSelect', () => {
    const fixture = create((h) => {
      h.frozenValue = PINNED;
      h.selectionMode = 'single';
    });
    bodyRows(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toBeNull();
    expect(fixture.componentInstance.onRowSelect).not.toHaveBeenCalled();
    expect(bodyRows(fixture)[0].getAttribute('aria-selected')).not.toBe('true');
  });

  // DAT-029.S4
  it('DAT-029.S4: a frozen row is display-only: double-clicking an editable cell opens no editor and the row has no pointer cursor', () => {
    const fixture = create((h) => {
      h.frozenValue = PINNED;
      h.editMode = 'cell';
      h.selectionMode = 'single';
    });
    const frozen = bodyRows(fixture)[0];
    frozen.querySelectorAll('td')[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input.edit-input')).toBeNull();
    expect(frozen.classList.contains('cursor-pointer')).toBe(false);
    expect(bodyRows(fixture)[1].classList.contains('cursor-pointer')).toBe(true);
  });

  // DAT-029.S5
  it('DAT-029.S5: with frozenRowsPosition bottom the frozen row is the last body row', () => {
    const fixture = create((h) => {
      h.frozenValue = PINNED;
      h.frozenRowsPosition = 'bottom';
    });
    expect(firstNames(fixture)).toEqual(['Widget', 'Gadget', 'Gizmo', 'Pinned']);
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" [(sortField)]="sortField" [(sortOrder)]="sortOrder" [reorderable]="reorderable" (rowReorder)="onRowReorder($event)" ariaLabel="Visibility">
      <med-table-column field="name" header="Name" [frozen]="frozenAll" width="100px" />
      <med-table-column field="price" header="Price" sortable [frozen]="frozenAll" width="100px" [visible]="priceVisible()" />
      <med-table-column field="stock" header="Stock" [frozen]="frozenAll" width="100px" />
    </med-data-table>
  `,
})
class VisibilityHostComponent {
  products: Product[] = PRODUCTS;
  priceVisible = signal(true);
  frozenAll = false;
  reorderable = false;
  onRowReorder = jest.fn();
  sortField: string | null = null;
  sortOrder: 'asc' | 'desc' | null = null;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="[]" ariaLabel="Spans">
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" [visible]="false" />
      <med-table-column field="stock" header="Stock" />
      <med-table-column field="extra" header="Extra" />
    </med-data-table>
  `,
})
class VisibilitySpanHostComponent {}

describe('DataTableComponent column visibility', () => {
  function create(setup: (host: VisibilityHostComponent) => void = () => undefined) {
    TestBed.configureTestingModule({ imports: [VisibilityHostComponent] });
    const fixture = TestBed.createComponent(VisibilityHostComponent);
    setup(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  const headerTexts = (fixture: ReturnType<typeof create>): string[] => Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead th')).map((th) => th.textContent!.trim());
  const rowTexts = (fixture: ReturnType<typeof create>): string[][] =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr')).map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent!.trim()));

  // DAT-032.S1
  it('DAT-032.S1: a column with visible false renders no header cell and no body cell', () => {
    const fixture = create((host) => (host.priceVisible.set(false)));

    expect(headerTexts(fixture)).toEqual(['Name', 'Stock']);
    expect(rowTexts(fixture)).toEqual([
      ['Widget', '5'],
      ['Gadget', '0'],
      ['Gizmo', '12'],
    ]);
  });

  // DAT-032.S2
  it('DAT-032.S2: setting visible back to true restores the column in its original position', () => {
    const fixture = create((host) => (host.priceVisible.set(false)));

    fixture.componentInstance.priceVisible.set(true);
    fixture.detectChanges();

    expect(headerTexts(fixture)).toEqual(['Name', 'Price', 'Stock']);
    expect(rowTexts(fixture)[0]).toEqual(['Widget', '30', '5']);
  });

  // DAT-032.S3
  it('DAT-032.S3: the empty-state cell spans only the visible columns', () => {
    TestBed.configureTestingModule({ imports: [VisibilitySpanHostComponent] });
    const fixture = TestBed.createComponent(VisibilitySpanHostComponent);
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector('tbody td') as HTMLElement;
    expect(cell.getAttribute('colspan')).toBe('3');
  });

  // DAT-032.S4
  it('DAT-032.S4: a hidden frozen column adds nothing to the offset of the frozen column after it', () => {
    const fixture = create((host) => {
      host.frozenAll = true;
      host.priceVisible.set(false);
    });

    const header = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead th'));
    expect(header).toHaveLength(2);
    expect(header[0].style.left).toBe('0px');
    expect(header[1].style.left).toBe('100px');
  });

  // DAT-032.S5
  it('DAT-032.S5: exportCSV leaves a hidden column out of the header and the rows', () => {
    const fixture = create((host) => (host.priceVisible.set(false)));
    let csv = '';
    const spy = jest.spyOn(globalThis, 'Blob' as never).mockImplementation(((parts: string[]) => {
      csv = parts[0];
      return {} as Blob;
    }) as never);
    (fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as DataTableComponent<Product>).exportCSV();
    spy.mockRestore();

    expect(csv).toBe('Name,Stock\nWidget,5\nGadget,0\nGizmo,12');
  });

  // DAT-032.S6
  it('DAT-032.S6: hiding and showing a sorted column keeps the sort', () => {
    const fixture = create((host) => {
      host.sortField = 'price';
      host.sortOrder = 'asc';
    });

    fixture.componentInstance.priceVisible.set(false);
    fixture.detectChanges();
    expect(rowTexts(fixture).map((cells) => cells[0])).toEqual(['Gadget', 'Gizmo', 'Widget']);

    fixture.componentInstance.priceVisible.set(true);
    fixture.detectChanges();
    const priceHeader = fixture.nativeElement.querySelectorAll('thead th')[1] as HTMLElement;
    expect(priceHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(rowTexts(fixture).map((cells) => cells[0])).toEqual(['Gadget', 'Gizmo', 'Widget']);
  });

  // DAT-001.S1
  it('DAT-001.S1: the empty label sits in one cell that spans only the visible columns', () => {
    TestBed.configureTestingModule({ imports: [VisibilitySpanHostComponent] });
    const fixture = TestBed.createComponent(VisibilitySpanHostComponent);
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('tbody td');
    expect(cells).toHaveLength(1);
    expect(cells[0].textContent).toContain('No results found');
    expect(cells[0].getAttribute('colspan')).toBe('3');
  });

  // DAT-009.S1
  it('DAT-009.S1: a quoted value is enclosed in quotes and the hidden column is not exported', () => {
    const fixture = create((host) => {
      host.products = [{ name: 'Widget, "Pro"', price: 30, stock: 5 }];
      host.priceVisible.set(false);
    });
    let csv = '';
    const spy = jest.spyOn(globalThis, 'Blob' as never).mockImplementation(((parts: string[]) => {
      csv = parts[0];
      return {} as Blob;
    }) as never);
    (fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as DataTableComponent<Product>).exportCSV();
    spy.mockRestore();

    expect(csv.split('\n')[1]).toBe('"Widget, ""Pro""",5');
  });

  // DAT-010.S1
  it('DAT-010.S1: rowReorder emits indices into value() while a column is hidden', () => {
    const fixture = create((host) => {
      host.reorderable = true;
      host.priceVisible.set(false);
      host.sortField = 'name';
      host.sortOrder = 'asc';
    });
    const drag = (type: string): Event => new Event(type, { bubbles: true, cancelable: true });
    const rows = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr'));

    rows[0].dispatchEvent(drag('dragstart')); // sorted by name: Gadget (index 1 in value())
    rows[2].dispatchEvent(drag('dragover')); // Widget (index 0 in value())
    rows[2].dispatchEvent(drag('drop'));

    expect(fixture.componentInstance.onRowReorder).toHaveBeenCalledWith({ dragIndex: 1, dropIndex: 0 });
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" [resizableColumns]="true" [columnResizeMode]="mode" (colResize)="onColResize($event)" ariaLabel="Resize">
      <med-table-column field="name" header="Name" width="200px" />
      <med-table-column field="price" header="Price" width="100px" />
      <med-table-column field="stock" header="Stock" width="150px" />
    </med-data-table>
  `,
})
class ResizeHostComponent {
  products: Product[] = PRODUCTS;
  mode: 'fit' | 'expand' = 'fit';
  onColResize = jest.fn();
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" [resizableColumns]="true" ariaLabel="Resize default">
      <med-table-column field="name" header="Name" width="200px" />
      <med-table-column field="price" header="Price" width="100px" />
      <med-table-column field="stock" header="Stock" width="150px" />
    </med-data-table>
  `,
})
class ResizeDefaultHostComponent {
  products: Product[] = PRODUCTS;
}

describe('DataTableComponent column resize modes', () => {
  const DECLARED_WIDTHS = [200, 100, 150];

  function create(mode?: 'fit' | 'expand') {
    TestBed.configureTestingModule({ imports: [ResizeHostComponent, ResizeDefaultHostComponent] });
    // Without a mode the host leaves `columnResizeMode` unbound, so the input default applies.
    const fixture = mode ? TestBed.createComponent(ResizeHostComponent) : (TestBed.createComponent(ResizeDefaultHostComponent) as unknown as ComponentFixture<ResizeHostComponent>);
    if (mode) {
      fixture.componentInstance.mode = mode;
    }
    fixture.detectChanges();
    // jsdom has no layout: report the declared widths as the measured ones.
    const headers = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead th'));
    headers.forEach((th, i) => (th.getBoundingClientRect = () => ({ width: DECLARED_WIDTHS[i] }) as DOMRect));
    (fixture.nativeElement.querySelector('table') as HTMLElement).getBoundingClientRect = () => ({ width: 450 }) as DOMRect;
    return fixture;
  }

  const headers = (fixture: ReturnType<typeof create>): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('thead th'));
  const handles = (fixture: ReturnType<typeof create>): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('[data-col-resize-handle="true"]'));

  /** Drags the handle of header `index` by `dx` pixels and releases it. */
  function drag(fixture: ReturnType<typeof create>, index: number, dx: number): void {
    const handle = headers(fixture)[index].querySelector('[data-col-resize-handle="true"]') as HTMLElement;
    const fire = (type: string, clientX: number): void => {
      handle.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX }));
    };
    fire('pointerdown', 0);
    fire('pointermove', dx);
    fire('pointerup', dx);
    fixture.detectChanges();
  }

  const table = (fixture: ReturnType<typeof create>): HTMLElement => fixture.nativeElement.querySelector('table');

  // DAT-031.S1
  it('DAT-031.S1: fit mode (the default) trades width between the dragged column and its right neighbour', () => {
    const fixture = create();

    drag(fixture, 0, 50);

    expect(headers(fixture)[0].style.width).toBe('250px');
    expect(headers(fixture)[1].style.width).toBe('50px');
    expect(headers(fixture)[2].style.width).toBe('150px');
    expect(table(fixture).style.width).toBe('');
  });

  // DAT-031.S2
  it('DAT-031.S2: fit mode stops when the neighbour reaches 40px and the dragged column only grows by what it gave up', () => {
    const fixture = create('fit');

    drag(fixture, 0, 200);

    expect(headers(fixture)[1].style.width).toBe('40px');
    expect(headers(fixture)[0].style.width).toBe('260px');
  });

  // DAT-031.S3
  it('DAT-031.S3: fit mode renders a handle on every header except the last visible one', () => {
    const fixture = create('fit');

    expect(handles(fixture)).toHaveLength(2);
    expect(headers(fixture)[2].querySelector('[data-col-resize-handle="true"]')).toBeNull();
  });

  // DAT-031.S4
  it('DAT-031.S4: expand mode changes only the dragged column and widens the table by the same amount', () => {
    const fixture = create('expand');

    drag(fixture, 0, 50);

    expect(headers(fixture)[0].style.width).toBe('250px');
    expect(headers(fixture)[1].style.width).toBe('100px');
    expect(headers(fixture)[2].style.width).toBe('150px');
    expect(table(fixture).style.width).toBe('500px');
    expect(handles(fixture)).toHaveLength(3);
  });

  // DAT-031.S4
  it('DAT-031.S4: expand mode does not shrink a column below 40px', () => {
    const fixture = create('expand');

    drag(fixture, 1, -500);

    expect(headers(fixture)[1].style.width).toBe('40px');
    expect(table(fixture).style.width).toBe('390px');
  });

  // DAT-031.S5
  it.each(['fit', 'expand'] as const)('DAT-031.S5: %s mode emits colResize with the header element and the width delta', (mode) => {
    const fixture = create(mode);

    drag(fixture, 0, 30);

    expect(fixture.componentInstance.onColResize).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.onColResize).toHaveBeenCalledWith({ element: headers(fixture)[0], delta: 30 });
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" ariaLabel="Groups">
      <ng-template #headerGroup>
        <tr>
          <th class="group-cell" colspan="2">Product</th>
          <th class="group-cell">Inventory</th>
        </tr>
      </ng-template>
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" sortable />
      <med-table-column field="stock" header="Stock" />
    </med-data-table>
  `,
})
class GroupHeaderHostComponent {
  products: Product[] = PRODUCTS;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" ariaLabel="Footer group">
      <ng-template #footerGroup>
        <tr>
          <td class="footer-cell" colspan="3">Total: 3 products</td>
        </tr>
      </ng-template>
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" />
      <med-table-column field="stock" header="Stock" />
    </med-data-table>
  `,
})
class GroupFooterHostComponent {
  products: Product[] = PRODUCTS;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" ariaLabel="No footer">
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" />
    </med-data-table>
  `,
})
class NoFooterHostComponent {
  products: Product[] = PRODUCTS;
}

describe('DataTableComponent column groups', () => {
  // DAT-033.S1
  it('DAT-033.S1: a #headerGroup row appears in the table header before the row of column headers', () => {
    TestBed.configureTestingModule({ imports: [GroupHeaderHostComponent] });
    const fixture = TestBed.createComponent(GroupHeaderHostComponent);
    fixture.detectChanges();

    const rows = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead tr'));
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector('.group-cell')).not.toBeNull();
    expect(rows[0].querySelector('.group-cell')!.getAttribute('colspan')).toBe('2');
    expect(Array.from(rows[1].querySelectorAll('th')).map((th) => th.textContent!.trim())).toEqual(['Name', 'Price', 'Stock']);
  });

  // DAT-033.S2
  it('DAT-033.S2: a #footerGroup row renders in a table footer after the body', () => {
    TestBed.configureTestingModule({ imports: [GroupFooterHostComponent] });
    const fixture = TestBed.createComponent(GroupFooterHostComponent);
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table') as HTMLElement;
    const tfoot = table.querySelector('tfoot');
    expect(tfoot).not.toBeNull();
    expect(tfoot!.querySelector('.footer-cell')!.textContent!.trim()).toBe('Total: 3 products');
    const tbody = table.querySelector('tbody')!;
    expect(tbody.compareDocumentPosition(tfoot!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  // DAT-033.S3
  it('DAT-033.S3: a table without a #footerGroup template renders no footer element', () => {
    TestBed.configureTestingModule({ imports: [NoFooterHostComponent] });
    const fixture = TestBed.createComponent(NoFooterHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tfoot')).toBeNull();
  });

  // DAT-033.S4
  it('DAT-033.S4: clicking a sortable column header still sorts the rows with a header group', () => {
    TestBed.configureTestingModule({ imports: [GroupHeaderHostComponent] });
    const fixture = TestBed.createComponent(GroupHeaderHostComponent);
    fixture.detectChanges();

    const priceHeader = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead tr:last-child th'))[1];
    priceHeader.click();
    fixture.detectChanges();

    const names = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr')).map((tr) => tr.querySelector('td')!.textContent!.trim());
    expect(names).toEqual(['Gadget', 'Gizmo', 'Widget']);
    expect(priceHeader.getAttribute('aria-sort')).toBe('ascending');
  });
});

interface ReorderColumnDef {
  field: string;
  header: string;
  frozen?: boolean;
  visible?: boolean;
  reorderable?: boolean;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="rows" [reorderableColumns]="enabled" [resizableColumns]="resizable" (colReorder)="onColReorder($event)" ariaLabel="Column reorder">
      @if (withGroup) {
        <ng-template #headerGroup>
          <tr>
            <th class="group-cell" colspan="2">Group</th>
            <th class="group-cell">Other</th>
          </tr>
        </ng-template>
      }
      @for (c of cols(); track c.field) {
        <med-table-column [field]="c.field" [header]="c.header" [frozen]="!!c.frozen" [visible]="c.visible !== false" [reorderable]="c.reorderable !== false" width="100px" />
      }
    </med-data-table>
  `,
})
class ReorderHostComponent {
  rows = [{ a: 'a1', b: 'b1', c: 'c1', f1: 'f11', f2: 'f21' }];
  enabled = true;
  resizable = false;
  withGroup = false;
  cols = signal<ReorderColumnDef[]>([
    { field: 'a', header: 'A' },
    { field: 'b', header: 'B' },
    { field: 'c', header: 'C' },
  ]);
  onColReorder = jest.fn();
}

describe('DataTableComponent column reorder', () => {
  function create(setup: (host: ReorderHostComponent) => void = () => undefined) {
    TestBed.configureTestingModule({ imports: [ReorderHostComponent] });
    const fixture = TestBed.createComponent(ReorderHostComponent);
    setup(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  const headerCells = (fixture: ComponentFixture<ReorderHostComponent>): HTMLElement[] => Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead tr:last-child th'));
  const headerTexts = (fixture: ComponentFixture<ReorderHostComponent>): string[] => headerCells(fixture).map((th) => th.textContent!.trim());
  const bodyTexts = (fixture: ComponentFixture<ReorderHostComponent>): string[] => Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr:first-child td')).map((td) => td.textContent!.trim());

  function fire(target: HTMLElement, type: string): void {
    target.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
  }

  function drag(fixture: ComponentFixture<ReorderHostComponent>, from: string, to: string): void {
    const cells = headerCells(fixture);
    const source = cells.find((th) => th.textContent!.trim() === from)!;
    const target = cells.find((th) => th.textContent!.trim() === to)!;
    fire(source, 'dragstart');
    fire(target, 'dragover');
    fire(target, 'drop');
    fire(source, 'dragend');
    fixture.detectChanges();
  }

  // DAT-034.S1
  it('DAT-034.S1: dragging a header onto another moves the column in headers and body rows', () => {
    const fixture = create();

    drag(fixture, 'A', 'C');

    expect(headerTexts(fixture)).toEqual(['B', 'C', 'A']);
    expect(bodyTexts(fixture)).toEqual(['b1', 'c1', 'a1']);
  });

  // DAT-034.S2
  it('DAT-034.S2: colReorder emits dragIndex, dropIndex and the new column order', () => {
    const fixture = create();

    drag(fixture, 'A', 'C');

    expect(fixture.componentInstance.onColReorder).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.onColReorder).toHaveBeenCalledWith({ dragIndex: 0, dropIndex: 2, columns: ['b', 'c', 'a'] });
  });

  // DAT-034.S3
  it('DAT-034.S3: dropping a header on itself changes nothing and does not emit', () => {
    const fixture = create();

    drag(fixture, 'B', 'B');

    expect(headerTexts(fixture)).toEqual(['A', 'B', 'C']);
    expect(fixture.componentInstance.onColReorder).not.toHaveBeenCalled();
  });

  // DAT-034.S4
  it('DAT-034.S4: a free column cannot be dropped onto a frozen column', () => {
    const fixture = create((host) =>
      host.cols.set([
        { field: 'f1', header: 'F', frozen: true },
        { field: 'a', header: 'A' },
        { field: 'b', header: 'B' },
      ]),
    );

    drag(fixture, 'A', 'F');

    expect(headerTexts(fixture)).toEqual(['F', 'A', 'B']);
    expect(fixture.componentInstance.onColReorder).not.toHaveBeenCalled();
  });

  // DAT-034.S5
  it('DAT-034.S5: frozen columns reorder among themselves and stay frozen with recomputed offsets', () => {
    const fixture = create((host) =>
      host.cols.set([
        { field: 'f1', header: 'F1', frozen: true },
        { field: 'f2', header: 'F2', frozen: true },
        { field: 'a', header: 'A' },
      ]),
    );

    drag(fixture, 'F1', 'F2');

    expect(headerTexts(fixture)).toEqual(['F2', 'F1', 'A']);
    const cells = headerCells(fixture);
    expect(cells[0].style.position).toBe('sticky');
    expect(cells[1].style.position).toBe('sticky');
    expect(cells[0].style.left).toBe('0px');
    expect(cells[1].style.left).toBe('100px');
    expect(cells[2].style.position).not.toBe('sticky');
  });

  // DAT-034.S6
  it('DAT-034.S6: a hidden column keeps its place in the order and returns to it when shown', () => {
    const fixture = create((host) =>
      host.cols.set([
        { field: 'a', header: 'A' },
        { field: 'b', header: 'B', visible: false },
        { field: 'c', header: 'C' },
      ]),
    );

    drag(fixture, 'A', 'C');
    expect(fixture.componentInstance.onColReorder).toHaveBeenCalledWith({ dragIndex: 0, dropIndex: 2, columns: ['b', 'c', 'a'] });

    fixture.componentInstance.cols.set([
      { field: 'a', header: 'A' },
      { field: 'b', header: 'B' },
      { field: 'c', header: 'C' },
    ]);
    fixture.detectChanges();

    expect(headerTexts(fixture)).toEqual(['B', 'C', 'A']);
  });

  // DAT-034.S7
  it('DAT-034.S7: a column with reorderable false is not draggable and is not a drop target', () => {
    const fixture = create((host) =>
      host.cols.set([
        { field: 'a', header: 'A' },
        { field: 'b', header: 'B', reorderable: false },
        { field: 'c', header: 'C' },
      ]),
    );

    drag(fixture, 'A', 'B');

    expect(headerTexts(fixture)).toEqual(['A', 'B', 'C']);
    expect(fixture.componentInstance.onColReorder).not.toHaveBeenCalled();
    expect(headerCells(fixture)[1].getAttribute('draggable')).not.toBe('true');
    expect(headerCells(fixture)[0].getAttribute('draggable')).toBe('true');
  });

  // Plan D-03: a native header drag must not start while a column resize is in progress
  it('plan D-03: dragstart is cancelled while a column resize is in progress and the order does not change', () => {
    const fixture = create((host) => (host.resizable = true));
    const cells = headerCells(fixture);
    const handle = cells[0].querySelector('[data-col-resize-handle="true"]') as HTMLElement;
    handle.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 0 }));

    const dragStart = new Event('dragstart', { bubbles: true, cancelable: true });
    cells[0].dispatchEvent(dragStart);
    fire(cells[2], 'dragover');
    fire(cells[2], 'drop');
    fixture.detectChanges();

    expect(dragStart.defaultPrevented).toBe(true);
    expect(headerTexts(fixture)).toEqual(['A', 'B', 'C']);
    expect(fixture.componentInstance.onColReorder).not.toHaveBeenCalled();
    handle.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true, clientX: 0 }));
  });

  // DAT-034.S10
  it('DAT-034.S10: a #headerGroup row keeps the cells the application wrote while the column header row follows the order', () => {
    const fixture = create((host) => (host.withGroup = true));

    drag(fixture, 'A', 'C');

    const groupCells = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead tr:first-child .group-cell'));
    expect(groupCells.map((th) => th.textContent!.trim())).toEqual(['Group', 'Other']);
    expect(groupCells[0].getAttribute('colspan')).toBe('2');
    expect(headerTexts(fixture)).toEqual(['B', 'C', 'A']);
  });

  // DAT-034.S11
  it('DAT-034.S11: without reorderableColumns no header is draggable and Alt+ArrowRight does nothing', () => {
    const fixture = create((host) => (host.enabled = false));

    expect(headerCells(fixture).every((th) => th.getAttribute('draggable') !== 'true')).toBe(true);

    drag(fixture, 'A', 'C');
    headerCells(fixture)[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(headerTexts(fixture)).toEqual(['A', 'B', 'C']);
    expect(fixture.componentInstance.onColReorder).not.toHaveBeenCalled();
  });

  function pressAlt(fixture: ComponentFixture<ReorderHostComponent>, header: HTMLElement, key: 'ArrowLeft' | 'ArrowRight'): void {
    header.focus();
    header.dispatchEvent(new KeyboardEvent('keydown', { key, altKey: true, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  // DAT-034.S8
  it('DAT-034.S8: Alt+ArrowRight moves the focused column one position, keeps focus, emits and announces', () => {
    const fixture = create();
    const headerB = headerCells(fixture)[1];

    pressAlt(fixture, headerB, 'ArrowRight');

    expect(headerTexts(fixture)).toEqual(['A', 'C', 'B']);
    expect(document.activeElement).toBe(headerCells(fixture).find((th) => th.textContent!.trim() === 'B'));
    expect(fixture.componentInstance.onColReorder).toHaveBeenCalledWith({ dragIndex: 1, dropIndex: 2, columns: ['a', 'c', 'b'] });
    const live = fixture.nativeElement.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(live).not.toBeNull();
    expect(live.textContent).toContain('B');
    expect(live.textContent).toContain('3');
  });

  // DAT-034.S9
  it('DAT-034.S9: Alt+ArrowLeft on the first column changes nothing and does not emit', () => {
    const fixture = create();

    pressAlt(fixture, headerCells(fixture)[0], 'ArrowLeft');

    expect(headerTexts(fixture)).toEqual(['A', 'B', 'C']);
    expect(fixture.componentInstance.onColReorder).not.toHaveBeenCalled();
  });
});

describe('DataTableComponent editing', () => {
  function nameCell(fixture: { nativeElement: HTMLElement }, index = 0): HTMLElement {
    return bodyRows(fixture)[index].querySelectorAll('td')[0] as HTMLElement;
  }

  function editInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement | null {
    return fixture.nativeElement.querySelector('input.edit-input');
  }

  // DAT-008.S2
  it('DAT-008.S2: a single click enters edit mode with editTrigger="click" and does not select the row', () => {
    const fixture = create((h) => {
      h.editMode = 'cell';
      h.editTrigger = 'click';
      h.selectionMode = 'single';
    });
    nameCell(fixture).click();
    fixture.detectChanges();

    expect(editInput(fixture)).not.toBeNull();
    expect(fixture.componentInstance.onRowSelect).not.toHaveBeenCalled();
    expect(fixture.componentInstance.selection).toBeNull();
  });

  // DAT-008.S3
  it('DAT-008.S3: a space and ArrowDown inside an edit input leave the selection and focus alone', () => {
    const fixture = create((h) => {
      h.editMode = 'cell';
      h.selectionMode = 'single';
    });
    nameCell(fixture).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    const input = editInput(fixture)!;
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowSelect).not.toHaveBeenCalled();
    expect(fixture.componentInstance.selection).toBeNull();
    expect(document.activeElement).toBe(input);
  });

  // DAT-008.S4
  it('DAT-008.S4: a single click does not enter edit mode with the default editTrigger', () => {
    const fixture = create((h) => (h.editMode = 'cell'));
    nameCell(fixture).click();
    fixture.detectChanges();
    expect(editInput(fixture)).toBeNull();
  });

  // DAT-008.S5
  it('DAT-008.S5: the double-click path selects the row on its first click, and a click inside the edit template changes nothing', () => {
    const fixture = create((h) => {
      h.editMode = 'cell';
      h.selectionMode = 'single';
    });
    const cell = nameCell(fixture);
    cell.click();
    cell.click();
    cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toBe(PRODUCTS[0]);
    const selectCalls = fixture.componentInstance.onRowSelect.mock.calls.length;

    editInput(fixture)!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selection).toBe(PRODUCTS[0]);
    expect(fixture.componentInstance.onRowSelect.mock.calls.length).toBe(selectCalls);
    expect(editInput(fixture)).not.toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" [editMode]="editMode" [selectionMode]="selectionMode" [(selection)]="selection" (rowEditComplete)="onRowEditComplete($event)" (rowEditCancel)="onRowEditCancel($event)" (rowSelect)="onRowSelect($event)">
      <med-table-column field="name" header="Name" editable>
        <ng-template let-row>{{ row.name }}</ng-template>
        <ng-template #editTemplate let-row let-onChange="onChange" let-onSave="onSave" let-onCancel="onCancel">
          <input class="name-input" [value]="row.name" (input)="onChange($any($event.target).value)" (keydown.enter)="onSave($any($event.target).value)" (keydown.escape)="onCancel()" />
        </ng-template>
      </med-table-column>
      <med-table-column field="price" header="Price">
        <ng-template let-row>{{ '$' + row.price }}</ng-template>
      </med-table-column>
      <med-table-column field="stock" header="Stock" editable>
        <ng-template let-row>{{ row.stock }}</ng-template>
        <ng-template #editTemplate let-row let-onChange="onChange">
          <input class="stock-input" [value]="row.stock" (input)="onChange($any($event.target).value)" />
        </ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class RowEditHostComponent {
  products: Product[] = PRODUCTS;
  editMode: 'cell' | 'row' | null = 'row';
  selectionMode: 'single' | null = null;
  selection: Product | null = null;
  onRowEditComplete = jest.fn();
  onRowEditCancel = jest.fn();
  onRowSelect = jest.fn();
}

describe('DataTableComponent row editing', () => {
  function createRowEdit(configure?: (h: RowEditHostComponent) => void) {
    const fixture = TestBed.createComponent(RowEditHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  function button(fixture: { nativeElement: HTMLElement }, row: number, label: string): HTMLButtonElement | null {
    return bodyRows(fixture)[row].querySelector(`button[aria-label="${label}"]`);
  }

  function type(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function inputs(fixture: { nativeElement: HTMLElement }): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('input.name-input, input.stock-input'));
  }

  // DAT-035.S1
  it('DAT-035.S1: edits every editable column at once and saves one rowEditComplete with both values', () => {
    const fixture = createRowEdit();
    expect(headerCells(fixture)).toHaveLength(4);
    button(fixture, 0, 'Edit row')!.click();
    fixture.detectChanges();

    const row = bodyRows(fixture)[0];
    expect(row.querySelector('input.name-input')).not.toBeNull();
    expect(row.querySelector('input.stock-input')).not.toBeNull();
    expect(button(fixture, 0, 'Edit row')).toBeNull();

    type(row.querySelector('input.name-input')!, 'Widget Pro');
    type(row.querySelector('input.stock-input')!, '9');
    button(fixture, 0, 'Save row')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowEditComplete).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.onRowEditComplete).toHaveBeenCalledWith({ row: PRODUCTS[0], values: { name: 'Widget Pro', stock: '9' } });
    expect(inputs(fixture)).toHaveLength(0);
    expect(cellText(bodyRows(fixture)[0])[0]).toBe('Widget');
  });

  // DAT-035.S2
  it('DAT-035.S2: cancel emits rowEditCancel with the row, never rowEditComplete, and restores the display', () => {
    const fixture = createRowEdit();
    button(fixture, 1, 'Edit row')!.click();
    fixture.detectChanges();
    button(fixture, 1, 'Cancel editing')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowEditCancel).toHaveBeenCalledWith(PRODUCTS[1]);
    expect(fixture.componentInstance.onRowEditComplete).not.toHaveBeenCalled();
    expect(inputs(fixture)).toHaveLength(0);
    expect(cellText(bodyRows(fixture)[1])[0]).toBe('Gadget');
  });

  // DAT-035.S3
  it('DAT-035.S3: Enter in an edit template saves the row and Escape cancels it', () => {
    const fixture = createRowEdit();
    button(fixture, 0, 'Edit row')!.click();
    fixture.detectChanges();
    const name = bodyRows(fixture)[0].querySelector('input.name-input') as HTMLInputElement;
    name.focus();
    name.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowEditComplete).toHaveBeenCalledTimes(1);
    expect(inputs(fixture)).toHaveLength(0);

    button(fixture, 0, 'Edit row')!.click();
    fixture.detectChanges();
    bodyRows(fixture)[0].querySelector('input.name-input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowEditCancel).toHaveBeenCalledWith(PRODUCTS[0]);
    expect(fixture.componentInstance.onRowEditComplete).toHaveBeenCalledTimes(1);
    expect(inputs(fixture)).toHaveLength(0);
  });

  // DAT-035.S1
  it('DAT-035.S1: rowEditComplete values include editable fields the user did not touch', () => {
    const fixture = createRowEdit();
    button(fixture, 0, 'Edit row')!.click();
    fixture.detectChanges();
    type(bodyRows(fixture)[0].querySelector('input.name-input')!, 'Widget Pro');
    button(fixture, 0, 'Save row')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowEditComplete).toHaveBeenCalledWith({
      row: PRODUCTS[0],
      values: { name: 'Widget Pro', stock: PRODUCTS[0].stock },
    });
  });

  // DAT-035.S3
  it('DAT-035.S3: Enter and Escape in an edit template with no key handlers save and cancel the row once', () => {
    const fixture = createRowEdit();
    button(fixture, 0, 'Edit row')!.click();
    fixture.detectChanges();
    const stock = bodyRows(fixture)[0].querySelector('input.stock-input') as HTMLInputElement;
    stock.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowEditComplete).toHaveBeenCalledTimes(1);
    expect(inputs(fixture)).toHaveLength(0);

    button(fixture, 0, 'Edit row')!.click();
    fixture.detectChanges();
    bodyRows(fixture)[0].querySelector('input.stock-input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowEditCancel).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.onRowEditComplete).toHaveBeenCalledTimes(1);
  });

  // DAT-035.S3
  it('DAT-035.S3: Enter on the edited row outside an edit template does not save it', () => {
    const fixture = createRowEdit();
    button(fixture, 0, 'Edit row')!.click();
    fixture.detectChanges();
    bodyRows(fixture)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowEditComplete).not.toHaveBeenCalled();
    expect(inputs(fixture)).toHaveLength(2);
  });

  // DAT-035.S4
  it('DAT-035.S4: renders no actions column or edit button with editMode unset or "cell"', () => {
    for (const mode of [null, 'cell'] as const) {
      const fixture = createRowEdit((h) => (h.editMode = mode));
      expect(headerCells(fixture)).toHaveLength(3);
      expect(fixture.nativeElement.querySelector('button[aria-label="Edit row"]')).toBeNull();
    }
  });

  // DAT-035.S5
  it('DAT-035.S5: starting a second row cancels the first and only the second shows edit templates', () => {
    const fixture = createRowEdit();
    button(fixture, 0, 'Edit row')!.click();
    fixture.detectChanges();
    button(fixture, 1, 'Edit row')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowEditCancel).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.onRowEditCancel).toHaveBeenCalledWith(PRODUCTS[0]);
    expect(bodyRows(fixture)[0].querySelector('input')).toBeNull();
    expect(bodyRows(fixture)[1].querySelectorAll('input')).toHaveLength(2);
  });

  // DAT-035.S6
  it('DAT-035.S6: activating an edit button does not select the row', () => {
    const fixture = createRowEdit((h) => (h.selectionMode = 'single'));
    button(fixture, 0, 'Edit row')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.onRowSelect).not.toHaveBeenCalled();
    expect(fixture.componentInstance.selection).toBeNull();
  });
});

interface TeamRow {
  id: string;
  team: string;
  name: string;
}

const TEAM_ROWS: TeamRow[] = [
  { id: '1', team: 'A', name: 'Ann' },
  { id: '2', team: 'A', name: 'Ari' },
  { id: '3', team: 'A', name: 'Abe' },
  { id: '4', team: 'B', name: 'Bob' },
  { id: '5', team: 'B', name: 'Bea' },
];

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rowsData"
      dataKey="id"
      rowGroupMode="rowspan"
      groupRowsBy="team"
      [paginator]="paginator"
      [rows]="pageRows"
      [first]="first"
      [selectionMode]="selectionMode"
      [(expandedRowKeys)]="expandedRowKeys"
    >
      <med-table-column field="team" header="Team" [visible]="teamVisible" />
      <med-table-column field="name" header="Name" [visible]="nameVisible" />
      <ng-template #rowexpansion let-row>
        <div class="expanded-detail">Detail: {{ row.name }}</div>
      </ng-template>
    </med-data-table>
  `,
})
class RowSpanHostComponent {
  rowsData: TeamRow[] = TEAM_ROWS;
  paginator = false;
  pageRows = 10;
  first = 0;
  teamVisible = true;
  nameVisible = true;
  selectionMode: 'multiple' | null = null;
  expandedRowKeys: Record<string, boolean> = {};
}

describe('DataTableComponent row-span grouping', () => {
  function createSpan(configure?: (h: RowSpanHostComponent) => void) {
    const fixture = TestBed.createComponent(RowSpanHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  function spanCells(fixture: { nativeElement: HTMLElement }): HTMLTableCellElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll<HTMLTableCellElement>('tbody td[rowspan]'));
  }

  function rowspans(fixture: { nativeElement: HTMLElement }): string[] {
    return spanCells(fixture).map((td) => `${td.textContent?.trim()}:${td.getAttribute('rowspan')}`);
  }

  // DAT-036.S1
  it('DAT-036.S1: renders one team cell per run with rowspan 3 and 2 and no subheader row', () => {
    const fixture = createSpan();
    const rows = bodyRows(fixture);

    expect(rowspans(fixture)).toEqual(['A:3', 'B:2']);
    expect(rows).toHaveLength(5);
    // Rows 2, 3 and 5 omit the team cell; every row except the run starts has one cell.
    expect(rows.map((tr) => tr.querySelectorAll('td').length)).toEqual([2, 1, 1, 2, 1]);
    // No subheader row: every row has an individual name cell and no full-width cell.
    expect(fixture.nativeElement.querySelector('tbody td[colspan]')).toBeNull();
  });

  // DAT-036.S2
  it('DAT-036.S2: a run never spans a page break — the second page has its own spans', () => {
    const fixture = createSpan((h) => {
      h.paginator = true;
      h.pageRows = 2;
      h.first = 2;
    });
    const rows = bodyRows(fixture);

    expect(rows).toHaveLength(2);
    expect(rowspans(fixture)).toEqual(['A:1', 'B:1']);
    expect(rows.map((tr) => cellText(tr))).toEqual([
      ['A', 'Abe'],
      ['B', 'Bob'],
    ]);
  });

  // DAT-036.S3
  it('DAT-036.S3: an expanded row inside a run adds one to the rowspan and its expansion row has one cell fewer', () => {
    const fixture = createSpan((h) => (h.expandedRowKeys = { '2': true }));

    expect(rowspans(fixture)).toEqual(['A:4', 'B:2']);
    const expansion = fixture.nativeElement.querySelector('.expanded-detail')!.closest('tr') as HTMLElement;
    const expansionCell = expansion.querySelector('td')!;
    const dataRow = bodyRows(fixture)[1];
    expect(expansion.querySelectorAll('td')).toHaveLength(1);
    // The data row beside it has the merged cell omitted too (only the name cell remains) and the
    // expansion cell spans the one remaining visible column, not both.
    expect(dataRow.querySelectorAll('td')).toHaveLength(1);
    expect(expansionCell.getAttribute('colspan')).toBe('1');
    // Table stays rectangular: 2 columns minus the merged one on every non-start row.
    const fullWidthOfRowsBelowMergedCell = [bodyRows(fixture)[1], expansion, bodyRows(fixture)[2]].map((tr) =>
      Array.from(tr.querySelectorAll('td')).reduce((sum, td) => sum + Number(td.getAttribute('colspan') ?? 1), 0),
    );
    expect(fullWidthOfRowsBelowMergedCell).toEqual([1, 1, 1]);
  });

  // DAT-036.S3
  it('DAT-036.S3: with a selection column before the merged column the expansion row splits around it and the table stays rectangular', () => {
    const fixture = createSpan((h) => {
      h.selectionMode = 'multiple';
      h.expandedRowKeys = { '2': true };
    });
    const expansion = fixture.nativeElement.querySelector('.expanded-detail')!.closest('tr') as HTMLElement;
    const colspans = Array.from(expansion.querySelectorAll('td')).map((td) => Number(td.getAttribute('colspan') ?? 1));

    // Columns: selection, team (merged from the run's first row), name. The expansion cells cover the two others.
    expect(colspans).toEqual([1, 1]);
    expect(colspans.reduce((a, b) => a + b, 0) + 1).toBe(3);
    expect(expansion.querySelectorAll('.expanded-detail')).toHaveLength(1);
  });

  // DAT-036.S3
  it('DAT-036.S3: with the merged column as the only column an expanded row renders no expansion row and adds nothing to the rowspan', () => {
    const fixture = createSpan((h) => {
      h.nameVisible = false;
      h.expandedRowKeys = { '2': true };
    });

    expect(fixture.nativeElement.querySelector('.expanded-detail')).toBeNull();
    expect(rowspans(fixture)).toEqual(['A:3', 'B:2']);
  });

  // DAT-036.S4
  it('DAT-036.S4: a hidden group column merges nothing and every row renders its own cells', () => {
    const fixture = createSpan((h) => (h.teamVisible = false));
    const rows = bodyRows(fixture);

    expect(rows).toHaveLength(5);
    expect(rows.map((tr) => cellText(tr))).toEqual([['Ann'], ['Ari'], ['Abe'], ['Bob'], ['Bea']]);
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('tbody td')).every((td) => Number((td as HTMLElement).getAttribute('rowspan') ?? 1) <= 1),
    ).toBe(true);
  });
});

interface CategoryRow {
  id: string;
  category: string;
  name: string;
}

const CATEGORY_ROWS: CategoryRow[] = [
  { id: '1', category: 'Hardware', name: 'Widget' },
  { id: '2', category: 'Hardware', name: 'Gadget' },
  { id: '3', category: 'Hardware', name: 'Gizmo' },
  { id: '4', category: 'Software', name: 'Editor' },
  { id: '5', category: 'Software', name: 'Browser' },
  { id: '6', category: 'Software', name: 'Compiler' },
];

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      #dt
      [value]="rowsData"
      dataKey="id"
      rowGroupMode="subheader"
      groupRowsBy="category"
      [expandableRowGroups]="expandable"
      [(expandedRowGroups)]="expandedRowGroups"
      [selectionMode]="'single'"
      [(selection)]="selection"
      [(expandedRowKeys)]="expandedRowKeys"
      (rowGroupExpand)="onExpand($event)"
      (rowGroupCollapse)="onCollapse($event)"
    >
      <med-table-column field="name" header="Name" />
      <med-table-column field="category" header="Category" />
      <ng-template #rowexpansion let-row>
        <div class="expanded-detail">Detail: {{ row.name }}</div>
      </ng-template>
    </med-data-table>
  `,
})
class RowGroupHostComponent {
  rowsData: CategoryRow[] = CATEGORY_ROWS;
  expandable = true;
  expandedRowGroups: readonly string[] = [];
  selection: CategoryRow | readonly CategoryRow[] | null = null;
  expandedRowKeys: Record<string, boolean> = {};
  onExpand = jest.fn();
  onCollapse = jest.fn();
}

describe('DataTableComponent expandable row groups', () => {
  function createGroups(configure?: (h: RowGroupHostComponent) => void) {
    const fixture = TestBed.createComponent(RowGroupHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  function subheaders(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
    return bodyRows(fixture).filter((tr) => tr.querySelectorAll('td').length === 1 && tr.querySelector('td')!.hasAttribute('colspan') && !tr.querySelector('.expanded-detail'));
  }

  function toggle(fixture: { nativeElement: HTMLElement }, index: number): HTMLButtonElement | null {
    return subheaders(fixture)[index]?.querySelector('button[aria-expanded]') ?? null;
  }

  function dataRowNames(fixture: { nativeElement: HTMLElement }): string[] {
    return bodyRows(fixture)
      .filter((tr) => !subheaders(fixture).includes(tr) && !tr.querySelector('.expanded-detail'))
      .map((tr) => cellText(tr)[0]);
  }

  // DAT-037.S1
  it('DAT-037.S1: collapsing a group hides its three rows, keeps its subheader, reports aria-expanded false and emits rowGroupCollapse', () => {
    const fixture = createGroups();
    expect(toggle(fixture, 0)!.getAttribute('aria-expanded')).toBe('true');
    expect(toggle(fixture, 0)!.getAttribute('aria-label')).toContain('Hardware');

    toggle(fixture, 0)!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.onCollapse).toHaveBeenCalledWith('Hardware');
    expect(fixture.componentInstance.expandedRowGroups).toEqual(['Hardware']);
    expect(subheaders(fixture)[0].textContent).toContain('Hardware');
    expect(toggle(fixture, 0)!.getAttribute('aria-expanded')).toBe('false');
    expect(dataRowNames(fixture)).not.toContain('Widget');
    expect(dataRowNames(fixture)).not.toContain('Gadget');
    expect(dataRowNames(fixture)).not.toContain('Gizmo');
  });

  it('DAT-037.S1: a collapsed group also hides the #rowexpansion rows attached to its rows', () => {
    const fixture = createGroups((h) => (h.expandedRowKeys = { '1': true }));
    expect(fixture.nativeElement.querySelector('.expanded-detail')).not.toBeNull();

    toggle(fixture, 0)!.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.expanded-detail')).toBeNull();
  });

  // DAT-037.S2
  it('DAT-037.S2: Enter on the toggle of a collapsed group shows its rows and emits rowGroupExpand', () => {
    const fixture = createGroups((h) => (h.expandedRowGroups = ['Hardware']));
    expect(dataRowNames(fixture)).not.toContain('Widget');
    expect(toggle(fixture, 0)!.getAttribute('aria-expanded')).toBe('false');

    toggle(fixture, 0)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onExpand).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.onExpand).toHaveBeenCalledWith('Hardware');
    expect(fixture.componentInstance.expandedRowGroups).toEqual([]);
    expect(dataRowNames(fixture)).toContain('Widget');
    expect(toggle(fixture, 0)!.getAttribute('aria-expanded')).toBe('true');
  });

  it('DAT-037.S2: the default empty model starts every group expanded', () => {
    const fixture = createGroups();
    expect(toggle(fixture, 0)!.getAttribute('aria-expanded')).toBe('true');
    expect(dataRowNames(fixture)).toContain('Widget');
  });

  // DAT-037.S3
  it('DAT-037.S3: renders no toggle without expandableRowGroups and shows every group', () => {
    const fixture = createGroups((h) => (h.expandable = false));
    expect(fixture.nativeElement.querySelector('tbody button[aria-expanded]')).toBeNull();
    expect(subheaders(fixture).length).toBeGreaterThan(0);
    expect(dataRowNames(fixture)).toContain('Widget');
  });

  // DAT-037.S4
  it('DAT-037.S4: a selected row stays selected after its group is collapsed and expanded', () => {
    const fixture = createGroups((h) => (h.selection = CATEGORY_ROWS[0]));
    toggle(fixture, 0)!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toBe(CATEGORY_ROWS[0]);

    toggle(fixture, 0)!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selection).toBe(CATEGORY_ROWS[0]);
    const row = bodyRows(fixture).find((tr) => cellText(tr)[0] === 'Widget')!;
    expect(row.getAttribute('aria-selected')).toBe('true');
  });

  it('DAT-037.S1: collapsing does not change the paginator and keeps collapsed rows in exportCSV()', () => {
    const fixture = createGroups();
    const table = fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as DataTableComponent<CategoryRow>;
    toggle(fixture, 0)!.click();
    fixture.detectChanges();

    expect(table.first()).toBe(0);
    let csv = '';
    const spy = jest.spyOn(globalThis, 'Blob' as never).mockImplementation(((parts: string[]) => {
      csv = parts[0];
      return {} as Blob;
    }) as never);
    table.exportCSV();
    spy.mockRestore();
    expect(csv.split('\n')).toHaveLength(7);
    expect(csv).toContain('Widget');
  });
});

interface Item {
  name: string;
  price: number;
}

const ITEMS: Item[] = [
  { name: 'Widget', price: 30 },
  { name: 'Gadget', price: 10 },
  { name: 'Widget Pro', price: 20 },
];

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="items" [filterable]="filterable" [(columnFilters)]="columnFilters" (filter)="onFilter($event)" ariaLabel="Items">
      <med-table-column field="name" header="Name" columnFilter />
      <med-table-column field="price" header="Price" />
    </med-data-table>
  `,
})
class ColumnFilterHostComponent {
  items: Item[] = ITEMS;
  filterable = false;
  columnFilters = signal<TableColumnFilters>({});
  onFilter = jest.fn();
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="items"
      [filterable]="filterable"
      [(columnFilters)]="columnFilters"
      [paginator]="paginator"
      [rows]="rows"
      [(first)]="first"
      [(sortField)]="sortField"
      [(sortOrder)]="sortOrder"
      [reorderableColumns]="reorderable"
      [selectionMode]="selectionMode"
      [matchModeLabels]="matchModeLabels"
      [lazy]="lazy"
      (lazyLoad)="onLazyLoad($event)"
      (filter)="onFilter($event)"
      (sort)="onSort($event)"
      (colReorder)="onColReorder($event)"
      ariaLabel="Items"
    >
      <med-table-column field="name" header="Name" sortable columnFilter [filterMatchModes]="nameModes" />
      <med-table-column field="price" header="Price" sortable [columnFilter]="priceFilter" filterType="numeric" [filterMatchModes]="priceModes" [filterMatchMode]="priceMode" />
      <med-table-column field="stock" header="Stock" />
    </med-data-table>
  `,
})
class ColumnFilterMenuHostComponent {
  items = [
    { name: 'Widget', price: 30, stock: 1 },
    { name: 'Gadget', price: 10, stock: 2 },
    { name: 'Widget Pro', price: 20, stock: 3 },
  ];
  filterable = false;
  columnFilters = signal<TableColumnFilters>({});
  paginator = false;
  rows = 10;
  first = signal(0);
  sortField: string | null = null;
  sortOrder: 'asc' | 'desc' | null = null;
  reorderable = false;
  selectionMode: 'multiple' | null = null;
  matchModeLabels: Partial<Record<TableFilterMatchMode, string>> = {};
  nameModes: readonly TableFilterMatchMode[] | null = null;
  priceFilter = false;
  priceModes: readonly TableFilterMatchMode[] | null = null;
  priceMode: TableFilterMatchMode | null = null;
  onFilter = jest.fn();
  onSort = jest.fn();
  onColReorder = jest.fn();
  lazy = false;
  onLazyLoad = jest.fn();
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="items" stateKey="dt-column-filter-state" [(columnFilters)]="columnFilters" [(sortField)]="sortField" [(sortOrder)]="sortOrder" ariaLabel="Releases">
      <med-table-column field="name" header="Name" sortable columnFilter />
      <med-table-column field="price" header="Price" sortable columnFilter filterType="numeric" filterMatchMode="gte" />
      <med-table-column field="released" header="Released" columnFilter filterType="date" />
    </med-data-table>
  `,
})
class ColumnFilterStateHostComponent {
  items = [
    { name: 'Widget', price: 30, released: new Date(2026, 2, 9, 23, 30) },
    { name: 'Gadget', price: 10, released: new Date(2026, 2, 10, 8, 0) },
    { name: 'Widget Pro', price: 20, released: new Date(2026, 2, 11, 0, 0) },
  ];
  columnFilters = signal<TableColumnFilters>({});
  sortField: string | null = null;
  sortOrder: 'asc' | 'desc' | null = null;
}

describe('DataTableComponent column filters', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  function createFiltered(configure?: (h: ColumnFilterHostComponent) => void) {
    const fixture = TestBed.createComponent(ColumnFilterHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  function names(fixture: { nativeElement: HTMLElement }): string[] {
    return bodyRows(fixture).map((tr) => cellText(tr)[0]);
  }

  // DAT-038.S2
  it('DAT-038.S2: an active rule "wid" on name combined with the global text "pro" shows only the rows that match both', () => {
    const fixture = createFiltered((h) => {
      h.filterable = true;
      h.columnFilters.set({ name: { matchMode: 'contains', value: 'wid' } });
    });
    expect(names(fixture)).toEqual(['Widget', 'Widget Pro']);

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'pro';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(names(fixture)).toEqual(['Widget Pro']);
  });

  it('DAT-038.S2: a rule set by the host filters the rows and an inactive rule filters nothing', () => {
    const fixture = createFiltered((h) => h.columnFilters.set({ name: { matchMode: 'equals', value: '' } }));
    expect(names(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);

    fixture.componentInstance.columnFilters.set({ name: { matchMode: 'startsWith', value: 'gad' } });
    fixture.detectChanges();

    expect(names(fixture)).toEqual(['Gadget']);
  });

  it('DAT-038.S2: a rule for an unknown field is ignored', () => {
    const fixture = createFiltered((h) => h.columnFilters.set({ missing: { matchMode: 'equals', value: 'x' } }));
    expect(names(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
  });

  // DAT-009.S2
  it('DAT-009.S2: exportCSV() with an active rule holds the header and only the rows that pass it', () => {
    const fixture = createFiltered((h) => h.columnFilters.set({ name: { matchMode: 'notContains', value: 'gadget' } }));
    const table = fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as DataTableComponent<Item>;
    let csv = '';
    const spy = jest.spyOn(globalThis, 'Blob' as never).mockImplementation(((parts: string[]) => {
      csv = parts[0];
      return {} as Blob;
    }) as never);
    table.exportCSV();
    spy.mockRestore();

    expect(csv).toBe('Name,Price\nWidget,30\nWidget Pro,20');
  });

  describe('menu', () => {
    afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));

    type MenuFixture = ComponentFixture<ColumnFilterMenuHostComponent>;

    function createMenu(configure?: (h: ColumnFilterMenuHostComponent) => void): MenuFixture {
      const fixture = TestBed.createComponent(ColumnFilterMenuHostComponent);
      configure?.(fixture.componentInstance);
      fixture.detectChanges();
      return fixture;
    }

    /** First non-empty cell of each body row, so a selection column before `name` does not shift it. */
    function rowNames(fixture: MenuFixture): string[] {
      return bodyRows(fixture).map((tr) => cellText(tr).find((text) => text !== '') ?? '');
    }

    function headerFor(fixture: MenuFixture, header: string): HTMLElement {
      return headerCells(fixture).find((th) => th.textContent?.includes(header))!;
    }

    function funnel(fixture: MenuFixture, header: string): HTMLButtonElement {
      return fixture.nativeElement.querySelector(`thead th button[aria-label="Filter ${header}"]`) as HTMLButtonElement;
    }

    function funnelIcon(fixture: MenuFixture, header: string): IconComponent {
      const button = fixture.debugElement.query(By.css(`thead th button[aria-label="Filter ${header}"]`));
      return button.query(By.directive(IconComponent)).componentInstance as IconComponent;
    }

    function menu(): HTMLElement | null {
      return document.querySelector('.cdk-overlay-pane[role="dialog"]');
    }

    function openMenu(fixture: MenuFixture, header: string): HTMLElement {
      funnel(fixture, header).click();
      fixture.detectChanges();
      return menu()!;
    }

    function valueInput(): HTMLInputElement {
      return menu()!.querySelector('input:not([type="hidden"])') as HTMLInputElement;
    }

    function typeValue(fixture: MenuFixture, text: string): void {
      const input = valueInput();
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
    }

    function pressEnter(fixture: MenuFixture, target: HTMLElement): void {
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();
    }

    function menuButton(label: string): HTMLButtonElement | undefined {
      return Array.from(menu()!.querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
    }

    function matchModeSelect(): HTMLElement | null {
      return menu()!.querySelector('[role="combobox"]');
    }

    // DAT-038.S1
    it('DAT-038.S1: typing "wid" in the name menu and pressing Enter shows only "Widget" and "Widget Pro", closes the menu and marks the funnel active', () => {
      const fixture = createMenu();
      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
      expect(funnelIcon(fixture, 'Name').variant()).not.toBe('solid');

      openMenu(fixture, 'Name');
      typeValue(fixture, 'wid');
      pressEnter(fixture, valueInput());

      expect(rowNames(fixture)).toEqual(['Widget', 'Widget Pro']);
      expect(menu()).toBeNull();
      expect(funnelIcon(fixture, 'Name').variant()).toBe('solid');
    });

    it('DAT-038.S1: the menu holds a match mode select, a value control, and Apply and Clear buttons', () => {
      const fixture = createMenu();
      openMenu(fixture, 'Name');

      expect(menu()).not.toBeNull();
      expect(matchModeSelect()).not.toBeNull();
      expect(valueInput()).not.toBeNull();
      expect(menuButton('Apply')).toBeDefined();
      expect(menuButton('Clear')).toBeDefined();
    });

    it('DAT-038.S1: the match mode select is left out when the column offers a single mode', () => {
      const fixture = createMenu((h) => (h.nameModes = ['equals']));
      openMenu(fixture, 'Name');

      expect(matchModeSelect()).toBeNull();
      expect(valueInput()).not.toBeNull();
    });

    // DAT-038.S3
    it('DAT-038.S3: Clear removes the active rule on name, shows all rows and drops the active state', () => {
      const fixture = createMenu((h) => h.columnFilters.set({ name: { matchMode: 'contains', value: 'wid' } }));
      expect(rowNames(fixture)).toEqual(['Widget', 'Widget Pro']);
      expect(funnelIcon(fixture, 'Name').variant()).toBe('solid');

      openMenu(fixture, 'Name');
      menuButton('Clear')!.click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
      expect(funnelIcon(fixture, 'Name').variant()).not.toBe('solid');
      expect(fixture.componentInstance.columnFilters()['name']).toBeUndefined();
      expect(menu()).toBeNull();
    });

    // DAT-038.S4
    it('DAT-038.S4: clicking the funnel of a sortable, reorderable name column after a selection column opens the menu and leaves the sort unchanged', () => {
      const fixture = createMenu((h) => {
        h.reorderable = true;
        h.selectionMode = 'multiple';
      });
      expect(headerFor(fixture, 'Name').getAttribute('aria-sort')).toBe('none');

      openMenu(fixture, 'Name');

      expect(menu()).not.toBeNull();
      expect(fixture.componentInstance.sortField).toBeNull();
      expect(fixture.componentInstance.sortOrder).toBeNull();
      expect(fixture.componentInstance.onSort).not.toHaveBeenCalled();
      expect(headerFor(fixture, 'Name').getAttribute('aria-sort')).toBe('none');
      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
    });

    it('DAT-038.S4: Enter, Space and Alt+ArrowRight on the funnel neither sort nor move the column, and Enter opens the menu', () => {
      const fixture = createMenu((h) => {
        h.reorderable = true;
        h.selectionMode = 'multiple';
      });
      const button = funnel(fixture, 'Name');
      const headersBefore = headerCells(fixture).map((th) => th.textContent?.trim());

      button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true }));
      pressEnter(fixture, button);
      // A browser turns Enter on a native button into a click; jsdom does not.
      button.click();
      fixture.detectChanges();

      expect(menu()).not.toBeNull();
      expect(fixture.componentInstance.sortField).toBeNull();
      expect(fixture.componentInstance.onSort).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onColReorder).not.toHaveBeenCalled();
      expect(headerCells(fixture).map((th) => th.textContent?.trim())).toEqual(headersBefore);
      expect(headerFor(fixture, 'Name').getAttribute('aria-sort')).toBe('none');
    });

    // DAT-038.S5
    it('DAT-038.S5: Escape discards a typed draft, closes the menu, leaves the rows unfiltered and returns focus to the funnel', () => {
      const fixture = createMenu();
      const button = funnel(fixture, 'Name');
      expect(button.getAttribute('aria-haspopup')).toBe('dialog');
      expect(button.getAttribute('aria-expanded')).toBe('false');

      openMenu(fixture, 'Name');
      expect(button.getAttribute('aria-expanded')).toBe('true');
      typeValue(fixture, 'wid');
      menu()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(menu()).toBeNull();
      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
      expect(fixture.componentInstance.columnFilters()).toEqual({});
      expect(document.activeElement).toBe(button);
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('DAT-038.S5: an outside click also closes the menu without committing and returns focus to the funnel', () => {
      const fixture = createMenu();
      const button = funnel(fixture, 'Name');
      openMenu(fixture, 'Name');
      typeValue(fixture, 'wid');

      const outside = bodyRows(fixture)[0];
      outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      outside.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(menu()).toBeNull();
      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
      expect(document.activeElement).toBe(button);
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    // DAT-038.S6
    it('DAT-038.S6: applying a rule from the second page shows the first page of the filtered rows', () => {
      const fixture = createMenu((h) => {
        h.paginator = true;
        h.rows = 2;
        h.first.set(2);
      });
      expect(rowNames(fixture)).toEqual(['Widget Pro']);

      openMenu(fixture, 'Name');
      typeValue(fixture, 'wid');
      menuButton('Apply')!.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.first()).toBe(0);
      expect(rowNames(fixture)).toEqual(['Widget', 'Widget Pro']);
      expect(menu()).toBeNull();
    });

    // DAT-038.S7
    it('DAT-038.S7: only the name header, which has columnFilter, renders a funnel button', () => {
      const fixture = createMenu();

      expect(headerFor(fixture, 'Name').querySelector('button[aria-label="Filter Name"]')).not.toBeNull();
      expect(headerFor(fixture, 'Price').querySelector('button')).toBeNull();
      expect(headerFor(fixture, 'Stock').querySelector('button')).toBeNull();
    });

    // DAT-038.S8
    it('DAT-038.S8: a rule written by the application filters the rows and marks the funnel, and a rule applied in the menu updates columnFilters', () => {
      const fixture = createMenu((h) => h.columnFilters.set({ name: { matchMode: 'startsWith', value: 'gad' } }));

      expect(rowNames(fixture)).toEqual(['Gadget']);
      expect(funnelIcon(fixture, 'Name').variant()).toBe('solid');

      openMenu(fixture, 'Name');
      expect(valueInput().value).toBe('gad');
      typeValue(fixture, 'wid');
      pressEnter(fixture, valueInput());

      expect(fixture.componentInstance.columnFilters()).toEqual({ name: { matchMode: 'startsWith', value: 'wid' } });
      expect(rowNames(fixture)).toEqual(['Widget', 'Widget Pro']);
    });

    // DAT-039.S4
    it('DAT-039.S4: a numeric column listing gt, lt and a text-only mode, preselecting gt, offers only lt and gt with gt selected', () => {
      const fixture = createMenu((h) => {
        h.priceFilter = true;
        h.priceModes = ['gt', 'lt', 'startsWith'];
        h.priceMode = 'gt';
        h.matchModeLabels = { gt: 'Greater', lt: 'Less', startsWith: 'Starts' };
      });
      openMenu(fixture, 'Price');

      expect(matchModeSelect()!.textContent?.trim()).toContain('Greater');

      // jsdom never lays out the select panel's virtual scroll rows (see select.component.spec.ts), so read the offered options from the select itself.
      const select = fixture.debugElement.query(By.directive(SelectComponent)).componentInstance as SelectComponent<TableFilterMatchMode>;
      const options = select.options() as readonly { label: string; value: TableFilterMatchMode }[];
      expect(options.map((o) => o.label)).toEqual(['Less', 'Greater']);
      expect(options.map((o) => o.value)).toEqual(['lt', 'gt']);
    });

    // DAT-004.S2
    it('DAT-004.S2: applying a column rule under the global text "pro" emits filter with "pro" and the rows that pass both', () => {
      const fixture = createMenu((h) => (h.filterable = true));
      const search = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
      search.value = 'pro';
      search.dispatchEvent(new Event('input'));
      jest.advanceTimersByTime(300);
      fixture.detectChanges();
      const host = fixture.componentInstance;
      host.onFilter.mockClear();

      openMenu(fixture, 'Name');
      typeValue(fixture, 'widget');
      menuButton('Apply')!.click();
      fixture.detectChanges();

      expect(host.onFilter).toHaveBeenCalledTimes(1);
      expect(host.onFilter).toHaveBeenCalledWith({ value: 'pro', data: [host.items[2]] });
      expect(rowNames(fixture)).toEqual(['Widget Pro']);
    });

    // DAT-007.S2
    it('DAT-007.S2: in a lazy table a rule that would hide a row leaves all three rows shown and lazyLoad emits it in columnFilters', () => {
      const fixture = createMenu((h) => (h.lazy = true));
      const host = fixture.componentInstance;
      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
      host.onLazyLoad.mockClear();

      openMenu(fixture, 'Name');
      typeValue(fixture, 'wid');
      pressEnter(fixture, valueInput());

      expect(host.columnFilters()).toEqual({ name: { matchMode: 'contains', value: 'wid' } });
      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
      expect(host.onLazyLoad).toHaveBeenCalledTimes(1);
      expect(host.onLazyLoad).toHaveBeenLastCalledWith(expect.objectContaining({ first: 0, columnFilters: { name: { matchMode: 'contains', value: 'wid' } } }));
    });
  });

  describe('state', () => {
    const STATE_KEY = 'dt-column-filter-state';

    beforeEach(() => sessionStorage.clear());
    afterEach(() => {
      sessionStorage.clear();
      document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
    });

    type StateFixture = ComponentFixture<ColumnFilterStateHostComponent>;

    function createState(): StateFixture {
      const fixture = TestBed.createComponent(ColumnFilterStateHostComponent);
      fixture.detectChanges();
      fixture.detectChanges(); // state is restored after the first render
      return fixture;
    }

    function rowNames(fixture: StateFixture): string[] {
      return bodyRows(fixture).map((tr) => cellText(tr)[0]);
    }

    function funnelIcon(fixture: StateFixture, header: string): IconComponent {
      const button = fixture.debugElement.query(By.css(`thead th button[aria-label="Filter ${header}"]`));
      return button.query(By.directive(IconComponent)).componentInstance as IconComponent;
    }

    function applyFromMenu(fixture: StateFixture, header: string, text: string): void {
      (fixture.nativeElement.querySelector(`thead th button[aria-label="Filter ${header}"]`) as HTMLButtonElement).click();
      fixture.detectChanges();
      const input = document.querySelector('.cdk-overlay-pane[role="dialog"] input:not([type="hidden"])') as HTMLInputElement;
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();
    }

    // DAT-010.S2
    it('DAT-010.S2: a text, a numeric and a date rule applied in one table hold in a new table with the same stateKey, which filters its rows by them', () => {
      const first = createState();
      applyFromMenu(first, 'Name', 'wid');
      applyFromMenu(first, 'Price', '25');
      first.componentInstance.columnFilters.update((rules) => ({ ...rules, released: { matchMode: 'dateBefore', value: new Date(2026, 2, 10) } }));
      first.detectChanges();
      expect(rowNames(first)).toEqual(['Widget']);
      first.destroy();

      const second = createState();
      const restored = second.componentInstance.columnFilters();

      expect(restored).toEqual({
        name: { matchMode: 'contains', value: 'wid' },
        price: { matchMode: 'gte', value: 25 },
        released: { matchMode: 'dateBefore', value: new Date(2026, 2, 10) },
      });
      expect(restored['released'].value).toBeInstanceOf(Date);
      expect(rowNames(second)).toEqual(['Widget']);
      expect(funnelIcon(second, 'Name').variant()).toBe('solid');
      expect(funnelIcon(second, 'Price').variant()).toBe('solid');
      expect(funnelIcon(second, 'Released').variant()).toBe('solid');
    });

    it('DAT-010.S2: a stored entry for an unknown field, a wrong-typed value or an invalid date is dropped on restore', () => {
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          first: 0,
          sortField: null,
          sortOrder: null,
          expandedRowKeys: {},
          columnFilters: {
            name: { matchMode: 'startsWith', value: 'gad' },
            missing: { matchMode: 'contains', value: 'x' },
            price: { matchMode: 'gt', value: 'abc' },
            released: { matchMode: 'dateIs', value: 'not-a-date' },
          },
        }),
      );
      const fixture = createState();

      expect(fixture.componentInstance.columnFilters()).toEqual({ name: { matchMode: 'startsWith', value: 'gad' } });
      expect(rowNames(fixture)).toEqual(['Gadget']);
    });

    // DAT-010.S3
    it('DAT-010.S3: stored state with a sort and no column filters restores the sort with no column rule active', () => {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ first: 0, sortField: 'price', sortOrder: 'desc', expandedRowKeys: {} }));
      const fixture = createState();

      expect(fixture.componentInstance.sortField).toBe('price');
      expect(fixture.componentInstance.sortOrder).toBe('desc');
      expect(rowNames(fixture)).toEqual(['Widget', 'Widget Pro', 'Gadget']);
      expect(fixture.componentInstance.columnFilters()).toEqual({});
      expect(funnelIcon(fixture, 'Name').variant()).not.toBe('solid');
      expect(funnelIcon(fixture, 'Price').variant()).not.toBe('solid');
      expect(funnelIcon(fixture, 'Released').variant()).not.toBe('solid');
    });
  });
});
