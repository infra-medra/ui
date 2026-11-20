import { Component, DebugElement, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';

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

  it('shows the empty label and spans all columns when there is nothing to show', () => {
    const fixture = create((h) => (h.products = []));
    const rows = bodyRows(fixture);
    expect(rows).toHaveLength(1);
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

    it('a global filter matches against any visible column value, after the debounce', () => {
      const fixture = create((h) => (h.filterable = true));
      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
      input.value = 'gizmo';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

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

    it('emits lazyLoad once on init, and again whenever page/sort/filter changes', () => {
      const fixture = create((h) => {
        h.lazy = true;
        h.paginator = true;
      });
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledWith({
        first: 0,
        rows: 10,
        sortField: null,
        sortOrder: null,
        multiSortMeta: [],
        filter: '',
      });

      headerCells(fixture)[0].click(); // sort by Name
      fixture.detectChanges();
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenLastCalledWith(expect.objectContaining({ sortField: 'name', sortOrder: 'asc' }));
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

    it('Enter in the edit template commits editComplete with the new value and exits edit mode', () => {
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

    it('indices refer to value() order, not the currently sorted/displayed order', () => {
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

      expect(fixture.nativeElement.querySelectorAll('[data-col-resize-handle="true"]').length).toBeGreaterThanOrEqual(2);
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
