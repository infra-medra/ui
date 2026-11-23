import { Component, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContextMenuDirective } from '../context-menu/context-menu.directive';
import { IconComponent } from '../icon/icon.component';
import { MenuItem } from '../menu/menu.types';
import { SelectComponent } from '../select/select.component';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableColumnFilters, TableContextMenuSelectEvent, TableFilterMatchMode, TableLazyLoadEvent } from './data-table.types';

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
  it('DAT-033.S3: a table without a #footerGroup template and with no column footer or #footer template renders no footer element', () => {
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

  describe('caption and summary slots', () => {
    it('DAT-040.S1: renders #caption above the table header and #summary below the table and before the paginator', () => {
      @Component({
        standalone: true,
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table [value]="rows" [paginator]="true" [rows]="2">
            <ng-template #caption>
              <span data-testid="caption-content">Products inventory</span>
            </ng-template>
            <med-table-column field="name" header="Name" />
            <ng-template #summary>
              <span data-testid="summary-content">Total: 3 items</span>
            </ng-template>
          </med-data-table>
        `,
      })
      class Host {
        rows = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const caption = el.querySelector('[data-testid="caption-content"]') as HTMLElement | null;
      const thead = el.querySelector('thead') as HTMLElement | null;
      const table = el.querySelector('table') as HTMLElement | null;
      const summary = el.querySelector('[data-testid="summary-content"]') as HTMLElement | null;
      const paginator = el.querySelector('med-paginator') as HTMLElement | null;

      expect(caption?.textContent).toContain('Products inventory');
      expect(summary?.textContent).toContain('Total: 3 items');
      expect(caption).toBeTruthy();
      expect(thead).toBeTruthy();
      expect(table).toBeTruthy();
      expect(summary).toBeTruthy();
      expect(paginator).toBeTruthy();

      expect(caption!.compareDocumentPosition(thead!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(table!.compareDocumentPosition(summary!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(summary!.compareDocumentPosition(paginator!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('DAT-040.S2: renders no caption or summary wrapper elements when omitted', () => {
      @Component({
        standalone: true,
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table [value]="rows">
            <med-table-column field="name" header="Name" />
          </med-data-table>
        `,
      })
      class Host {
        rows = [{ name: 'A' }];
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-med-caption]')).toBeNull();
      expect(el.querySelector('[data-med-summary]')).toBeNull();
    });
  });

  describe('custom empty template', () => {
    it('DAT-041.S1: renders #empty template inside spanning empty-state cell instead of emptyLabel', () => {
      @Component({
        standalone: true,
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table [value]="rows" [loading]="false">
            <med-table-column field="name" header="Name" />
            <med-table-column field="role" header="Role" />
            <ng-template #empty>
              <div data-testid="custom-empty">Nothing to display yet</div>
            </ng-template>
          </med-data-table>
        `,
      })
      class Host {
        rows: { name: string; role: string }[] = [];
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const emptyCell = el.querySelector('tbody tr td') as HTMLTableCellElement | null;
      expect(emptyCell?.getAttribute('colspan')).toBe('2');
      expect(emptyCell?.querySelector('[data-testid="custom-empty"]')?.textContent).toContain('Nothing to display yet');
      expect(el.textContent).not.toContain('No results found');
    });

    it('DAT-041.S2: falls back to emptyLabel when #empty template is omitted', () => {
      @Component({
        standalone: true,
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table [value]="rows" [loading]="false" emptyLabel="Custom empty text">
            <med-table-column field="name" header="Name" />
          </med-data-table>
        `,
      })
      class Host {
        rows: { name: string }[] = [];
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('tbody tr td')?.textContent).toContain('Custom empty text');
    });
  });

  describe('skeleton loading', () => {
    it('DAT-042.S1: renders 5 skeleton rows across all visible columns without spinner overlay when loadingMode is skeleton', () => {
      @Component({
        standalone: true,
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table [value]="rows" [loading]="true" loadingMode="skeleton" selectionMode="multiple">
            <med-table-column field="name" header="Name" />
            <med-table-column field="category" header="Category" />
            <med-table-column field="price" header="Price" />
          </med-data-table>
        `,
      })
      class Host {
        rows: { name: string; category: string; price: number }[] = [];
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const bodyRows = el.querySelectorAll('tbody tr');
      expect(bodyRows.length).toBe(5);
      expect(bodyRows[0].querySelectorAll('td').length).toBe(4);
      expect(bodyRows[0].querySelectorAll('med-skeleton').length).toBe(4);
      expect(el.querySelector('thead th:nth-child(2)')?.textContent).toContain('Name');
      expect(el.querySelector('med-progress-spinner')).toBeNull();
      expect(el.querySelector('table')?.getAttribute('aria-busy')).toBe('true');
      expect(el.querySelector('[role="status"]')?.textContent).toContain('Loading');
    });

    it('DAT-042.S1: matches rows input count when paginator is enabled', () => {
      @Component({
        standalone: true,
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table [value]="rows" [loading]="true" loadingMode="skeleton" [paginator]="true" [rows]="3">
            <med-table-column field="name" header="Name" />
            <med-table-column field="price" header="Price" />
          </med-data-table>
        `,
      })
      class Host {
        rows: { name: string; price: number }[] = [];
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('tbody tr').length).toBe(3);
      expect(el.querySelectorAll('tbody tr:first-child med-skeleton').length).toBe(2);
    });

    it('DAT-042.S2: removes skeleton placeholders and renders data rows when loading becomes false', () => {
      @Component({
        standalone: true,
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table [value]="rows" [loading]="loading()" loadingMode="skeleton">
            <med-table-column field="name" header="Name" />
            <med-table-column field="price" header="Price" />
          </med-data-table>
        `,
      })
      class Host {
        loading = signal(true);
        rows = [
          { name: 'Widget', price: 10 },
          { name: 'Gadget', price: 20 },
        ];
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('med-skeleton').length).toBeGreaterThan(0);

      fixture.componentInstance.loading.set(false);
      fixture.detectChanges();

      expect(el.querySelectorAll('med-skeleton').length).toBe(0);
      expect(el.querySelector('table')?.getAttribute('aria-busy')).toBeNull();
      const bodyRows = el.querySelectorAll('tbody tr');
      expect(bodyRows.length).toBe(2);
      expect(bodyRows[0].textContent).toContain('Widget');
      expect(bodyRows[1].textContent).toContain('Gadget');
    });

    it('DAT-042 / DAT-028: gives frozen skeleton data and utility cells opaque backgrounds and scroll-facing side borders', () => {
      @Component({
        standalone: true,
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table [value]="rows" [loading]="true" loadingMode="skeleton" [reorderable]="true" selectionMode="multiple">
            <med-table-column field="name" header="Name" [frozen]="leftFrozen()" width="120px" />
            <med-table-column field="category" header="Category" />
            <med-table-column field="price" header="Price" [frozen]="true" alignFrozen="right" width="100px" />
          </med-data-table>
        `,
      })
      class Host {
        leftFrozen = signal(true);
        rows: { name: string; category: string; price: number }[] = [];
      }

      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();

      const cells = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr:first-child td'));
      expect(cells.length).toBe(5);
      // Reorder and selection utility cells freeze on the left with an opaque background when a left-frozen column exists.
      expect(cells[0].classList).toContain('bg-surface-0');
      expect(cells[1].classList).toContain('bg-surface-0');
      // Left-frozen data cell gets opaque background and right border.
      expect(cells[2].classList).toContain('bg-surface-0');
      expect(cells[2].classList).toContain('border-r');
      expect(cells[2].classList).toContain('border-surface-200');
      // Non-frozen data cell gets neither frozen background nor side border.
      expect(cells[3].classList).not.toContain('bg-surface-0');
      expect(cells[3].classList).not.toContain('border-r');
      expect(cells[3].classList).not.toContain('border-l');
      // Right-frozen data cell gets opaque background and left border.
      expect(cells[4].classList).toContain('bg-surface-0');
      expect(cells[4].classList).toContain('border-l');
      expect(cells[4].classList).toContain('border-surface-200');

      // When only right-frozen columns exist, utility cells do not stick or take an opaque frozen background.
      fixture.componentInstance.leftFrozen.set(false);
      fixture.detectChanges();
      const updatedCells = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr:first-child td'));
      expect(updatedCells[0].classList).not.toContain('bg-surface-0');
      expect(updatedCells[1].classList).not.toContain('bg-surface-0');
    });
  });
});

describe('DataTableComponent cell selection', () => {
  interface CellRow {
    readonly id: number;
    readonly name: string;
    readonly status: string;
  }

  function createCellHost(configure?: (host: CellSelectionHost) => void) {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="rows()"
          [cellSelection]="cellSelection"
          [selectionMode]="selectionMode"
          [(selection)]="selection"
          [dataKey]="dataKey"
          (cellSelect)="selectedEvents.push($event)"
          (cellUnselect)="unselectedEvents.push($event)"
          (rowSelect)="rowSelectedEvents.push($event)"
        >
          <med-table-column field="name" header="Name" />
          <med-table-column field="status" header="Status" />
        </med-data-table>
      `,
    })
    class CellSelectionHost {
      rows = signal<CellRow[]>([
        { id: 1, name: 'Widget', status: 'active' },
        { id: 2, name: 'Gadget', status: 'critical' },
      ]);
      cellSelection = true;
      selectionMode: 'single' | 'multiple' | null = 'single';
      selection: { row: CellRow; field: string } | readonly { row: CellRow; field: string }[] | null = null;
      dataKey: string | null = null;
      selectedEvents: { row: CellRow; field: string }[] = [];
      unselectedEvents: { row: CellRow; field: string }[] = [];
      rowSelectedEvents: CellRow[] = [];
    }

    const fixture = TestBed.createComponent(CellSelectionHost);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('DAT-043.S1: single cell selection selects clicked cell, suppresses row selection attributes, and moves selection on next cell click', () => {
    const fixture = createCellHost();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;
    const rows = Array.from(el.querySelectorAll('tbody tr'));
    const cells = Array.from(el.querySelectorAll('tbody td'));

    // Row-level aria-selected and tabindex are suppressed in cell selection mode.
    for (const row of rows) {
      expect(row.getAttribute('aria-selected')).toBeNull();
      expect(row.getAttribute('tabindex')).toBeNull();
    }
    // Data cells are focusable and initially unselected.
    for (const cell of cells) {
      expect(cell.getAttribute('tabindex')).toBe('0');
      expect(cell.getAttribute('aria-selected')).toBe('false');
    }

    (cells[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(cells[1].getAttribute('aria-selected')).toBe('true');
    expect(cells[0].getAttribute('aria-selected')).toBe('false');
    expect(host.selection).toEqual({ row: host.rows()[0], field: 'status' });
    expect(host.selectedEvents).toEqual([{ row: host.rows()[0], field: 'status' }]);
    expect(host.rowSelectedEvents).toEqual([]);

    // Clicking an already-selected cell in single mode is a no-op.
    (cells[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(host.selectedEvents.length).toBe(1);
    expect(host.unselectedEvents.length).toBe(0);
    expect(host.selection).toEqual({ row: host.rows()[0], field: 'status' });

    // Clicking a second cell moves selection to it.
    (cells[2] as HTMLElement).click();
    fixture.detectChanges();
    expect(cells[1].getAttribute('aria-selected')).toBe('false');
    expect(cells[2].getAttribute('aria-selected')).toBe('true');
    expect(host.selection).toEqual({ row: host.rows()[1], field: 'name' });
    expect(host.selectedEvents).toEqual([
      { row: host.rows()[0], field: 'status' },
      { row: host.rows()[1], field: 'name' },
    ]);
  });

  it('DAT-043.S2: multiple cell selection toggles cells, suppresses row checkbox column, and matches by dataKey across object references', () => {
    const fixture = createCellHost((h) => {
      h.selectionMode = 'multiple';
      h.dataKey = 'id';
    });
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    // Row selection checkbox column is not rendered when cellSelection is enabled.
    expect(el.querySelector('input[type="checkbox"]')).toBeNull();
    const cells = Array.from(el.querySelectorAll('tbody td'));
    expect(cells.length).toBe(4);

    (cells[0] as HTMLElement).click();
    (cells[3] as HTMLElement).click();
    fixture.detectChanges();

    expect(cells[0].getAttribute('aria-selected')).toBe('true');
    expect(cells[3].getAttribute('aria-selected')).toBe('true');
    expect(host.selection).toEqual([
      { row: host.rows()[0], field: 'name' },
      { row: host.rows()[1], field: 'status' },
    ]);
    expect(host.selectedEvents.length).toBe(2);

    // Replace rows with fresh references having the same dataKey ids.
    const clonedRows = host.rows().map((r) => ({ ...r }));
    host.rows.set(clonedRows);
    fixture.detectChanges();

    const updatedCells = Array.from(el.querySelectorAll('tbody td'));
    expect(updatedCells[0].getAttribute('aria-selected')).toBe('true');
    expect(updatedCells[3].getAttribute('aria-selected')).toBe('true');

    // Clicking an already-selected cell deselects it and emits cellUnselect.
    (updatedCells[0] as HTMLElement).click();
    fixture.detectChanges();

    expect(updatedCells[0].getAttribute('aria-selected')).toBe('false');
    expect(updatedCells[3].getAttribute('aria-selected')).toBe('true');
    expect(host.selection).toEqual([{ row: expect.objectContaining({ id: 2 }), field: 'status' }]);
    expect(host.unselectedEvents).toEqual([{ row: clonedRows[0], field: 'name' }]);
  });

  it('DAT-043.S2: without dataKey, cell row matching compares by object reference', () => {
    const fixture = createCellHost((h) => {
      h.selectionMode = 'multiple';
      h.dataKey = null;
    });
    const host = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;
    const cells = Array.from(el.querySelectorAll('tbody td'));

    (cells[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(cells[0].getAttribute('aria-selected')).toBe('true');

    // New object references with identical fields do not match without dataKey.
    host.rows.set(host.rows().map((r) => ({ ...r })));
    fixture.detectChanges();

    const updatedCells = Array.from(el.querySelectorAll('tbody td'));
    expect(updatedCells[0].getAttribute('aria-selected')).toBe('false');
  });

  it('DAT-043.S1 / DAT-043.S2: Enter and Space activate cell selection in single and multiple modes', () => {
    const singleFixture = createCellHost((h) => (h.selectionMode = 'single'));
    const singleEl = singleFixture.nativeElement as HTMLElement;
    const singleCells = Array.from(singleEl.querySelectorAll('tbody td'));

    singleCells[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    singleFixture.detectChanges();
    expect(singleCells[0].getAttribute('aria-selected')).toBe('true');
    expect(singleFixture.componentInstance.selectedEvents).toEqual([{ row: singleFixture.componentInstance.rows()[0], field: 'name' }]);

    const multiFixture = createCellHost((h) => (h.selectionMode = 'multiple'));
    const multiEl = multiFixture.nativeElement as HTMLElement;
    const multiCells = Array.from(multiEl.querySelectorAll('tbody td'));

    multiCells[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    multiFixture.detectChanges();
    expect(multiCells[1].getAttribute('aria-selected')).toBe('true');
    expect(multiFixture.componentInstance.selectedEvents).toEqual([{ row: multiFixture.componentInstance.rows()[0], field: 'status' }]);

    multiCells[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    multiFixture.detectChanges();
    expect(multiCells[1].getAttribute('aria-selected')).toBe('false');
    expect(multiFixture.componentInstance.unselectedEvents).toEqual([{ row: multiFixture.componentInstance.rows()[0], field: 'status' }]);
  });

  it('DAT-043: does not enable cell selection attributes when selectionMode is null', () => {
    const fixture = createCellHost((h) => (h.selectionMode = null));
    const el = fixture.nativeElement as HTMLElement;
    const cells = Array.from(el.querySelectorAll('tbody td'));

    for (const cell of cells) {
      expect(cell.getAttribute('tabindex')).toBeNull();
      expect(cell.getAttribute('aria-selected')).toBeNull();
    }

    (cells[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toBeNull();
    expect(fixture.componentInstance.selectedEvents).toEqual([]);
  });

  it('DAT-043: exportCSV({ selectionOnly: true }) deduplicates rows when multiple cells in the same row are selected', () => {
    const captureCsv = (fixture: ComponentFixture<unknown>): string => {
      let capturedCsv = '';
      const spy = jest.spyOn(globalThis, 'Blob' as never).mockImplementation(((parts: string[]) => {
        capturedCsv = parts[0];
        return {} as Blob;
      }) as never);
      try {
        const table = fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as DataTableComponent<CellRow>;
        table.exportCSV({ selectionOnly: true });
      } finally {
        spy.mockRestore();
      }
      return capturedCsv;
    };

    const fixture = createCellHost((h) => {
      h.selectionMode = 'multiple';
    });
    const cells = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody td'));

    // Select both cells on row 0 and one cell on row 1.
    (cells[0] as HTMLElement).click();
    (cells[1] as HTMLElement).click();
    (cells[3] as HTMLElement).click();
    fixture.detectChanges();

    expect(captureCsv(fixture)).toBe('Name,Status\nWidget,active\nGadget,critical');

    // Also deduplicate via dataKey when selection entries hold distinct object references for the same key.
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table [value]="rows()" [cellSelection]="true" selectionMode="multiple" dataKey="id" [selection]="selection()">
          <med-table-column field="name" header="Name" />
          <med-table-column field="status" header="Status" />
        </med-data-table>
      `,
    })
    class KeyedCellExportHost {
      rows = signal<CellRow[]>([
        { id: 1, name: 'Widget', status: 'active' },
        { id: 2, name: 'Gadget', status: 'critical' },
      ]);
      selection = signal([
        { row: { id: 1, name: 'Widget', status: 'active' }, field: 'name' },
        { row: { id: 1, name: 'Widget', status: 'active' }, field: 'status' },
        { row: { id: 2, name: 'Gadget', status: 'critical' }, field: 'status' },
      ]);
    }

    const keyedFixture = TestBed.createComponent(KeyedCellExportHost);
    keyedFixture.detectChanges();
    expect(captureCsv(keyedFixture)).toBe('Name,Status\nWidget,active\nGadget,critical');
  });
});

describe('DataTableComponent conditional cell styling', () => {
  interface StatusRow {
    readonly id: number;
    readonly name: string;
    readonly status: string;
  }

  it('DAT-044.S1: applies cellClass only to matching body cells alongside alignment, gridlines, and frozen classes', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table [value]="rows()" [showGridlines]="true" [cellClass]="cellClass()">
          <med-table-column field="name" header="Name" [frozen]="true" width="120px" />
          <med-table-column field="status" header="Status" align="right" />
        </med-data-table>
      `,
    })
    class CellClassHost {
      rows = signal<StatusRow[]>([
        { id: 1, name: 'Widget', status: 'active' },
        { id: 2, name: 'Gadget', status: 'critical' },
      ]);
      cellClass = signal<((row: StatusRow, field: string) => string) | null>((row, field) =>
        field === 'status' && row.status === 'critical' ? 'bg-red-100' : '',
      );
    }

    const fixture = TestBed.createComponent(CellClassHost);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const headers = Array.from(el.querySelectorAll('thead th'));
    const bodyRows = Array.from(el.querySelectorAll('tbody tr'));
    const row0Cells = Array.from(bodyRows[0].querySelectorAll('td'));
    const row1Cells = Array.from(bodyRows[1].querySelectorAll('td'));

    // Header cells never receive cellClass.
    for (const th of headers) {
      expect(th.classList).not.toContain('bg-red-100');
    }

    // Non-matching row and non-matching column do not receive bg-red-100.
    expect(row0Cells[0].classList).not.toContain('bg-red-100');
    expect(row0Cells[1].classList).not.toContain('bg-red-100');
    expect(row1Cells[0].classList).not.toContain('bg-red-100');

    // Frozen column keeps frozen styling when cellClass is also configured.
    expect(row1Cells[0].classList).toContain('bg-surface-0');
    expect(row1Cells[0].classList).toContain('border-r');

    // Matching body cell receives bg-red-100 alongside alignment and gridlines.
    expect(row1Cells[1].classList).toContain('bg-red-100');
    expect(row1Cells[1].classList).toContain('text-right');
    expect(row1Cells[1].classList).toContain('border-x');

    // Updating cellClass to null removes the conditional class.
    fixture.componentInstance.cellClass.set(null);
    fixture.detectChanges();
    expect(row1Cells[1].classList).not.toContain('bg-red-100');
  });

  it('DAT-044.S1: preserves frozen cell border classes when cellClass styles a frozen column cell', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table [value]="rows()" [cellClass]="cellClass">
          <med-table-column field="status" header="Status" [frozen]="true" alignFrozen="right" width="120px" />
          <med-table-column field="name" header="Name" />
        </med-data-table>
      `,
    })
    class FrozenCellClassHost {
      rows = signal<StatusRow[]>([
        { id: 1, name: 'Widget', status: 'active' },
        { id: 2, name: 'Gadget', status: 'critical' },
      ]);
      cellClass = (row: StatusRow, field: string) => (field === 'status' && row.status === 'critical' ? 'bg-red-100 font-semibold' : '');
    }

    const fixture = TestBed.createComponent(FrozenCellClassHost);
    fixture.detectChanges();

    const bodyRows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr'));
    const row0Status = bodyRows[0].querySelectorAll('td')[0];
    const row1Status = bodyRows[1].querySelectorAll('td')[0];

    expect(row0Status.classList).toContain('bg-surface-0');
    expect(row0Status.classList).toContain('border-l');
    expect(row0Status.classList).not.toContain('bg-red-100');

    expect(row1Status.classList).toContain('bg-red-100');
    expect(row1Status.classList).toContain('font-semibold');
    expect(row1Status.classList).toContain('border-l');
  });
});

describe('DataTableComponent context menu integration', () => {
  interface ContextRow {
    readonly id: number;
    readonly name: string;
    readonly status: string;
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  @Component({
    standalone: true,
    imports: [DataTableComponent, TableColumnComponent, ContextMenuDirective],
    template: `
      <span #cm="medContextMenu" [medContextMenu]="menuItems()" (itemSelect)="activatedItems.push($event)"></span>
      <med-data-table
        [value]="rows()"
        [contextMenu]="linkMenu() ? cm : null"
        [(contextMenuSelection)]="selectedRow"
        (contextMenuSelect)="selectEvents.push($event)"
      >
        <med-table-column field="name" header="Name" />
        <med-table-column field="status" header="Status" />
      </med-data-table>
    `,
  })
  class ContextMenuHost {
    rows = signal<ContextRow[]>([
      { id: 1, name: 'Widget', status: 'active' },
      { id: 2, name: 'Gadget', status: 'paused' },
    ]);
    linkMenu = signal(true);
    selectedRow = signal<ContextRow | null>(null);
    selectEvents: TableContextMenuSelectEvent<ContextRow>[] = [];
    activatedItems: MenuItem[] = [];
    commandSpy = jest.fn();
    menuItems = signal<MenuItem[]>([
      { label: 'Inspect', command: this.commandSpy },
      { label: 'Archive' },
    ]);
  }

  function createContextHost(configure?: (h: ContextMenuHost) => void) {
    const fixture = TestBed.createComponent(ContextMenuHost);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  function menuPanel(): HTMLElement | null {
    return document.querySelector('[role="menu"]');
  }

  it('DAT-045.S1: right-clicking a body row updates contextMenuSelection, emits contextMenuSelect, prevents default, and opens the linked context menu', () => {
    const fixture = createContextHost();
    const host = fixture.componentInstance;
    const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr'));
    const secondRowCells = Array.from(rows[1].querySelectorAll('td'));

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 120, clientY: 80 });
    secondRowCells[1].dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(host.selectedRow()).toEqual(host.rows()[1]);
    expect(host.selectEvents.length).toBe(1);
    expect(host.selectEvents[0].originalEvent).toBe(event);
    expect(host.selectEvents[0].row).toEqual(host.rows()[1]);
    expect(host.selectEvents[0].field).toBe('status');
    expect(rows[1].classList).toContain('bg-brand-50');

    const panel = menuPanel();
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('Inspect');
    expect(panel!.textContent).toContain('Archive');

    // Selecting an item from the opened menu runs its command and closes the menu.
    panel!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(host.commandSpy).toHaveBeenCalledTimes(1);
    expect(host.activatedItems.map((i) => i.label)).toEqual(['Inspect']);
    expect(menuPanel()).toBeNull();
  });

  it('DAT-045.S2: Shift+F10 and ContextMenu keydown on a focused body row update contextMenuSelection, emit contextMenuSelect, and open the linked context menu', () => {
    const fixture = createContextHost();
    const host = fixture.componentInstance;
    const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('tbody tr'));

    expect(rows[0].getAttribute('tabindex')).toBe('0');
    expect(rows[1].getAttribute('tabindex')).toBe('0');

    rows[0].focus();
    const shiftF10 = new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true });
    rows[0].dispatchEvent(shiftF10);
    fixture.detectChanges();

    expect(shiftF10.defaultPrevented).toBe(true);
    expect(host.selectedRow()).toEqual(host.rows()[0]);
    expect(host.selectEvents.length).toBe(1);
    expect(host.selectEvents[0].originalEvent).toBe(shiftF10);
    expect(host.selectEvents[0].row).toEqual(host.rows()[0]);
    expect(menuPanel()).not.toBeNull();

    // Close and trigger ContextMenu key on the second row.
    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(menuPanel()).toBeNull();

    rows[1].focus();
    const contextKey = new KeyboardEvent('keydown', { key: 'ContextMenu', bubbles: true, cancelable: true });
    rows[1].dispatchEvent(contextKey);
    fixture.detectChanges();

    expect(contextKey.defaultPrevented).toBe(true);
    expect(host.selectedRow()).toEqual(host.rows()[1]);
    expect(host.selectEvents.length).toBe(2);
    expect(host.selectEvents[1].originalEvent).toBe(contextKey);
    expect(host.selectEvents[1].row).toEqual(host.rows()[1]);
    expect(menuPanel()).not.toBeNull();
  });

  it('DAT-045: leaves native context menu unprevented and does not open an overlay when contextMenu is null', () => {
    const fixture = createContextHost((h) => h.linkMenu.set(false));
    const host = fixture.componentInstance;
    const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('tbody tr'));

    expect(rows[0].getAttribute('tabindex')).toBeNull();

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 40 });
    rows[0].querySelector('td')!.dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(false);
    expect(host.selectedRow()).toEqual(host.rows()[0]);
    expect(host.selectEvents.length).toBe(1);
    expect(menuPanel()).toBeNull();
  });

  it('DAT-045: does not highlight contextMenuSelection row or frozen cells when contextMenu is null', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent, ContextMenuDirective],
      template: `
        <span #cm="medContextMenu" [medContextMenu]="menuItems()"></span>
        <med-data-table
          [value]="rows()"
          [contextMenu]="linkMenu() ? cm : null"
          [(contextMenuSelection)]="selectedRow"
          (contextMenuSelect)="selectEvents.push($event)"
        >
          <med-table-column field="name" header="Name" [frozen]="true" width="120px" />
          <med-table-column field="status" header="Status" />
        </med-data-table>
      `,
    })
    class FrozenContextMenuHost {
      rows = signal<ContextRow[]>([
        { id: 1, name: 'Widget', status: 'active' },
        { id: 2, name: 'Gadget', status: 'paused' },
      ]);
      linkMenu = signal(false);
      selectedRow = signal<ContextRow | null>(null);
      selectEvents: TableContextMenuSelectEvent<ContextRow>[] = [];
      menuItems = signal<MenuItem[]>([{ label: 'Inspect' }]);
    }

    const fixture = TestBed.createComponent(FrozenContextMenuHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('tbody tr'));
    const frozenCell = rows[0].querySelector('td')!;

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 40 });
    frozenCell.dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(false);
    expect(host.selectedRow()).toEqual(host.rows()[0]);
    expect(host.selectEvents.length).toBe(1);
    expect(rows[0].classList).not.toContain('bg-brand-50');
    expect(rows[0].classList).not.toContain('dark:bg-brand-500/10');
    expect(frozenCell.classList).not.toContain('bg-brand-50');
    expect(frozenCell.classList).not.toContain('dark:bg-brand-950');

    // Linking a context menu highlights the active contextMenuSelection row and frozen cell; unlinking removes it.
    host.linkMenu.set(true);
    fixture.detectChanges();
    expect(rows[0].classList).toContain('bg-brand-50');
    expect(frozenCell.classList).toContain('bg-brand-50');
    expect(frozenCell.classList).toContain('dark:bg-brand-950');

    host.linkMenu.set(false);
    fixture.detectChanges();
    expect(rows[0].classList).not.toContain('bg-brand-50');
    expect(frozenCell.classList).not.toContain('bg-brand-50');
  });

  it('DAT-045: applies focus-visible outline classes only to focusable body rows', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent, ContextMenuDirective],
      template: `
        <span #cm="medContextMenu" [medContextMenu]="menuItems()"></span>
        <med-data-table
          [value]="rows()"
          [frozenValue]="frozenRows()"
          [contextMenu]="linkMenu() ? cm : null"
          [selectionMode]="selectionMode()"
          [cellSelection]="cellSelection()"
        >
          <med-table-column field="name" header="Name" />
          <med-table-column field="status" header="Status" />
        </med-data-table>
      `,
    })
    class FocusableRowHost {
      rows = signal<ContextRow[]>([{ id: 1, name: 'Widget', status: 'active' }]);
      frozenRows = signal<ContextRow[]>([{ id: 99, name: 'Pinned', status: 'locked' }]);
      linkMenu = signal(true);
      selectionMode = signal<'single' | 'multiple' | null>(null);
      cellSelection = signal(false);
      menuItems = signal<MenuItem[]>([{ label: 'Inspect' }]);
    }

    const fixture = TestBed.createComponent(FocusableRowHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    const getBodyAndFrozenRows = () => {
      const allRows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('tbody tr'));
      return { frozenRow: allRows[0], bodyRow: allRows[1] };
    };

    let { frozenRow, bodyRow } = getBodyAndFrozenRows();
    expect(bodyRow.getAttribute('tabindex')).toBe('0');
    expect(bodyRow.classList).toContain('focus-visible:outline-2');
    expect(bodyRow.classList).toContain('focus-visible:-outline-offset-2');
    expect(bodyRow.classList).toContain('focus-visible:outline-brand-500');
    expect(bodyRow.classList).toContain('dark:focus-visible:outline-brand-400');
    expect(bodyRow.classList).not.toContain('cursor-pointer');

    // Display-only frozen rows are never focusable and do not receive row focus-visible classes.
    expect(frozenRow.getAttribute('tabindex')).toBeNull();
    expect(frozenRow.classList).not.toContain('focus-visible:outline-2');

    // Unlinking contextMenu without row selection removes tabindex and focus-visible classes.
    host.linkMenu.set(false);
    fixture.detectChanges();
    ({ bodyRow } = getBodyAndFrozenRows());
    expect(bodyRow.getAttribute('tabindex')).toBeNull();
    expect(bodyRow.classList).not.toContain('focus-visible:outline-2');

    // When cell selection is active, row focus and row focus-visible classes are suppressed in favor of cells.
    host.linkMenu.set(true);
    host.selectionMode.set('multiple');
    host.cellSelection.set(true);
    fixture.detectChanges();
    ({ bodyRow } = getBodyAndFrozenRows());
    expect(bodyRow.getAttribute('tabindex')).toBeNull();
    expect(bodyRow.classList).not.toContain('focus-visible:outline-2');
  });
});

interface VirtualRow {
  id: number;
  name: string;
  score: number;
}

// jsdom has no layout and renders slowly, so unit tests use 1,000 rows; the 10,000-row scenarios run in Playwright.
const VIRTUAL_ROW_COUNT = 1000;

const makeVirtualRows = (count: number): VirtualRow[] => Array.from({ length: count }, (_, i) => ({ id: i, name: `Row ${i}`, score: i }));

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      [virtualScroll]="true"
      [virtualScrollItemSize]="40"
      [scrollHeight]="scrollHeight()"
      [paginator]="paginator()"
      [rows]="10"
      [selectionMode]="selectionMode()"
      [(selection)]="selection"
      [editMode]="editMode()"
      [reorderable]="reorderable()"
      (editComplete)="completed.push($event)"
      (editCancel)="cancelled.push($event)"
    >
      <med-table-column field="name" header="Name" editable>
        <ng-template let-row>{{ row.name }}</ng-template>
        <ng-template #editTemplate let-row let-onSave="onSave" let-onCancel="onCancel">
          <input class="edit-input" [value]="row.name" (keydown.enter)="onSave($any($event.target).value)" (keydown.escape)="onCancel()" />
        </ng-template>
      </med-table-column>
      <med-table-column field="score" header="Score" sortable>
        <ng-template let-row>{{ row.score }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class VirtualScrollHostComponent {
  rows = signal<VirtualRow[]>(makeVirtualRows(VIRTUAL_ROW_COUNT));
  scrollHeight = signal<string | null>('400px');
  paginator = signal(false);
  selectionMode = signal<'multiple' | null>(null);
  selection = signal<unknown>(null);
  editMode = signal<'cell' | null>(null);
  reorderable = signal(false);
  completed: unknown[] = [];
  cancelled: unknown[] = [];
}

describe('DataTableComponent virtual scroll', () => {
  const ITEM_SIZE = 40;

  function create(configure?: (host: VirtualScrollHostComponent) => void): ComponentFixture<VirtualScrollHostComponent> {
    const fixture = TestBed.createComponent(VirtualScrollHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  const el = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
  const viewport = (fixture: ComponentFixture<unknown>) => el(fixture).querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
  const bodyRows = (fixture: ComponentFixture<unknown>) => Array.from(el(fixture).querySelectorAll<HTMLElement>('tbody tr:not([aria-hidden="true"])'));
  const spacerHeights = (fixture: ComponentFixture<unknown>) =>
    Array.from(el(fixture).querySelectorAll<HTMLElement>('tbody tr[aria-hidden="true"] td')).map((td) => parseFloat(td.style.height) || 0);
  const rowByText = (fixture: ComponentFixture<unknown>, text: string) => bodyRows(fixture).find((tr) => tr.textContent?.includes(text));

  function scrollTo(fixture: ComponentFixture<unknown>, top: number): void {
    const vp = viewport(fixture);
    vp.scrollTop = top;
    vp.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  it('DAT-046.S1: renders only the window and sizes the scrollable area to every row', () => {
    const fixture = create();

    expect(bodyRows(fixture).length).toBeGreaterThan(0);
    expect(bodyRows(fixture).length).toBeLessThan(100);
    expect(rowByText(fixture, 'Row 0')).toBeDefined();
    const spacers = spacerHeights(fixture).reduce((sum, h) => sum + h, 0);
    expect(spacers + bodyRows(fixture).length * ITEM_SIZE).toBe(VIRTUAL_ROW_COUNT * ITEM_SIZE);
  });

  it('DAT-046.S3: sorting applies to the whole set and scrolls back to the first row', () => {
    const fixture = create();
    scrollTo(fixture, 500 * ITEM_SIZE);
    expect(viewport(fixture).scrollTop).toBe(500 * ITEM_SIZE);

    const scoreHeader = el(fixture).querySelectorAll<HTMLElement>('th[scope="col"]')[1];
    scoreHeader.click();
    fixture.detectChanges();
    scoreHeader.click();
    fixture.detectChanges();

    expect(viewport(fixture).scrollTop).toBe(0);
    expect(bodyRows(fixture)[0].textContent).toContain(`Row ${VIRTUAL_ROW_COUNT - 1}`);
  });

  it('DAT-046.S4: select-all covers rows that are not rendered', () => {
    const fixture = create((h) => h.selectionMode.set('multiple'));
    const host = fixture.componentInstance;
    expect(rowByText(fixture, `Row ${VIRTUAL_ROW_COUNT - 1}`)).toBeUndefined();

    const selectAll = el(fixture).querySelector<HTMLInputElement>('thead input[type="checkbox"]')!;
    selectAll.click();
    fixture.detectChanges();

    expect((host.selection() as unknown[]).length).toBe(VIRTUAL_ROW_COUNT);

    scrollTo(fixture, (VIRTUAL_ROW_COUNT - 1) * ITEM_SIZE);
    const last = rowByText(fixture, `Row ${VIRTUAL_ROW_COUNT - 1}`)!;
    expect(last).toBeDefined();
    expect(last.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true);
  });

  it('DAT-046.S5: renders no paginator and does not slice the row set', () => {
    const fixture = create((h) => h.paginator.set(true));

    expect(el(fixture).querySelector('med-paginator')).toBeNull();
    expect(bodyRows(fixture).length).toBeGreaterThan(10);

    scrollTo(fixture, 100 * ITEM_SIZE);
    expect(rowByText(fixture, 'Row 100')).toBeDefined();
  });

  it('DAT-046.S7: uses a 400 pixel viewport by default and still renders only a window', () => {
    const fixture = create((h) => h.scrollHeight.set(null));
    const vp = viewport(fixture);

    expect([vp.style.height, vp.style.maxHeight]).toContain('400px');
    expect(bodyRows(fixture).length).toBeLessThan(100);
  });

  it('DAT-046.S8: an open cell edit survives scrolling away and back without committing or cancelling', () => {
    const fixture = create((h) => h.editMode.set('cell'));
    const host = fixture.componentInstance;

    rowByText(fixture, 'Row 0')!.querySelector('td')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();
    el(fixture).querySelector<HTMLInputElement>('.edit-input')!.value = 'draft';

    scrollTo(fixture, 500 * ITEM_SIZE);
    expect(rowByText(fixture, 'Row 500')).toBeDefined();
    // Rows outside the window other than the edited one are not rendered.
    expect(bodyRows(fixture).some((tr) => tr.querySelector('td')?.textContent?.trim() === 'Row 1')).toBe(false);
    scrollTo(fixture, 0);

    const input = el(fixture).querySelector<HTMLInputElement>('.edit-input');
    expect(input).not.toBeNull();
    expect(input!.value).toBe('draft');
    expect(host.completed.length).toBe(0);
    expect(host.cancelled.length).toBe(0);
  });

  it('ignores reorderable: no drag handle column and no draggable rows', () => {
    const fixture = create((h) => h.reorderable.set(true));

    expect(bodyRows(fixture).some((tr) => tr.getAttribute('draggable') === 'true')).toBe(false);
    expect(el(fixture).querySelector('med-icon[name="bars-3"]')).toBeNull();
    expect(el(fixture).querySelectorAll('thead tr:first-child th').length).toBe(2);
    const spacerCell = el(fixture).querySelector<HTMLElement>('tbody tr[aria-hidden="true"] td');
    expect(spacerCell?.getAttribute('colspan')).toBe('2');
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="rows()" [virtualScroll]="true" [virtualScrollItemSize]="40" scrollHeight="400px" [frozenValue]="frozen()" [lazy]="lazy()" [totalRecords]="totalRecords()">
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class VirtualAriaHostComponent {
  rows = signal<VirtualRow[]>(makeVirtualRows(VIRTUAL_ROW_COUNT));
  frozen = signal<VirtualRow[] | null>(null);
  lazy = signal(false);
  totalRecords = signal<number | null>(null);
}

describe('DataTableComponent virtual scroll row positions', () => {
  function create(configure?: (host: VirtualAriaHostComponent) => void): ComponentFixture<VirtualAriaHostComponent> {
    const fixture = TestBed.createComponent(VirtualAriaHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
  const table = (fixture: ComponentFixture<unknown>) => root(fixture).querySelector('table')!;
  const dataRows = (fixture: ComponentFixture<unknown>) => Array.from(root(fixture).querySelectorAll<HTMLElement>('tbody tr[aria-rowindex]'));

  function scrollTo(fixture: ComponentFixture<unknown>, top: number): void {
    const viewport = root(fixture).querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
    viewport.scrollTop = top;
    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  it('DAT-047.S3: exposes the full row count and the real position of a rendered row', () => {
    const fixture = create();
    scrollTo(fixture, 500 * 40);

    expect(table(fixture).getAttribute('aria-rowcount')).toBe(String(VIRTUAL_ROW_COUNT + 1));
    const row = dataRows(fixture).find((tr) => tr.textContent?.includes('Row 500'))!;
    expect(row).toBeDefined();
    // One header row plus the 1-based position of index 500.
    expect(row.getAttribute('aria-rowindex')).toBe('502');
  });

  it('DAT-047.S3: counts frozen rows in aria-rowcount and numbers body rows after them', () => {
    const fixture = create((h) => h.frozen.set([{ id: -1, name: 'Pinned', score: -1 }]));

    expect(table(fixture).getAttribute('aria-rowcount')).toBe(String(VIRTUAL_ROW_COUNT + 2));
    const first = dataRows(fixture).find((tr) => tr.textContent?.includes('Row 0'))!;
    expect(first.getAttribute('aria-rowindex')).toBe('3');
  });

  it('DAT-047.S3: takes the row count from totalRecords in lazy mode', () => {
    const fixture = create((h) => {
      h.lazy.set(true);
      h.totalRecords.set(5000);
      h.rows.set(makeVirtualRows(5000));
    });

    expect(table(fixture).getAttribute('aria-rowcount')).toBe('5001');
  });

  it('DAT-047.S3: does not add row positions without virtualScroll', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `<med-data-table [value]="rows"><med-table-column field="name" header="Name" /></med-data-table>`,
    })
    class PlainHost {
      rows = makeVirtualRows(3);
    }
    const fixture = TestBed.createComponent(PlainHost);
    fixture.detectChanges();

    expect(table(fixture).getAttribute('aria-rowcount')).toBeNull();
    expect(dataRows(fixture).length).toBe(0);
  });
});

const LAZY_TOTAL = 100000;
const LAZY_BLOCK = 50;

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      [virtualScroll]="true"
      [virtualScrollItemSize]="40"
      scrollHeight="400px"
      [lazy]="true"
      [totalRecords]="total"
      [rows]="blockSize"
      selectionMode="single"
      [(selection)]="selection"
      (lazyLoad)="events.push($event)"
    >
      <med-table-column field="name" header="Name" sortable>
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
      <med-table-column field="score" header="Score">
        <ng-template let-row>{{ row.score }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class LazyVirtualHostComponent {
  total = LAZY_TOTAL;
  blockSize = LAZY_BLOCK;
  /** A `totalRecords`-sized array in which only the delivered blocks hold rows. */
  rows = signal<(VirtualRow | null)[]>(Array.from({ length: LAZY_TOTAL }, () => null));
  selection = signal<unknown>(null);
  events: TableLazyLoadEvent[] = [];

  deliver(first: number, count: number): void {
    const next = [...this.rows()];
    for (let i = first; i < first + count; i++) {
      next[i] = { id: i, name: `Row ${i}`, score: i };
    }
    this.rows.set(next);
  }
}

describe('DataTableComponent lazy virtual scroll', () => {
  function create(configure?: (host: LazyVirtualHostComponent) => void): ComponentFixture<LazyVirtualHostComponent> {
    const fixture = TestBed.createComponent(LazyVirtualHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
  const viewport = (fixture: ComponentFixture<unknown>) => root(fixture).querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
  const rowAt = (fixture: ComponentFixture<unknown>, index: number) => root(fixture).querySelector<HTMLElement>(`tbody tr[aria-rowindex="${index + 2}"]`);
  const firsts = (host: LazyVirtualHostComponent) => host.events.map((event) => event.first);

  function scrollToRow(fixture: ComponentFixture<unknown>, index: number): void {
    const element = viewport(fixture);
    element.scrollTop = index * 40;
    element.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  it('DAT-048.S1: emits the first block and the block after it on init', () => {
    const fixture = create();
    const host = fixture.componentInstance;

    expect(host.events[0]).toEqual(expect.objectContaining({ first: 0, rows: LAZY_BLOCK, sortField: null, filter: '', columnFilters: {} }));
    expect(firsts(host)).toEqual([0, LAZY_BLOCK]);
  });

  it('DAT-048.S2: requests the block in view once, however often it is scrolled over', () => {
    const fixture = create();
    const host = fixture.componentInstance;

    scrollToRow(fixture, 50000);
    scrollToRow(fixture, 49990);
    scrollToRow(fixture, 50000);
    scrollToRow(fixture, 49990);
    scrollToRow(fixture, 50000);

    expect(firsts(host).filter((first) => first === 50000).length).toBe(1);
    expect(firsts(host).filter((first) => first === 0).length).toBe(1);
  });

  it('DAT-048.S3: shows skeleton placeholders that cannot be selected or focused until the data arrives', () => {
    const fixture = create();
    const host = fixture.componentInstance;
    scrollToRow(fixture, 50000);

    const row = rowAt(fixture, 50000)!;
    expect(row).not.toBeNull();
    // One skeleton in each of the two visible columns.
    expect(row.querySelectorAll('med-skeleton').length).toBe(2);
    expect(row.getAttribute('tabindex')).toBeNull();

    row.querySelector('td')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.selection()).toBeNull();

    host.deliver(50000, LAZY_BLOCK);
    fixture.detectChanges();
    const loaded = rowAt(fixture, 50000)!;
    expect(loaded.querySelectorAll('med-skeleton').length).toBe(0);
    expect(loaded.textContent).toContain('Row 50000');
  });

  it('DAT-048.S4: a sort discards the requested blocks, scrolls to the top and requests the first block again', () => {
    const fixture = create();
    const host = fixture.componentInstance;
    scrollToRow(fixture, 50000);
    expect(firsts(host).filter((first) => first === 50000).length).toBe(1);

    root(fixture).querySelector<HTMLElement>('th[scope="col"]')!.click();
    fixture.detectChanges();

    expect(viewport(fixture).scrollTop).toBe(0);
    expect(host.events.some((event) => event.first === 0 && event.sortField === 'name' && event.sortOrder === 'asc')).toBe(true);

    scrollToRow(fixture, 50000);
    expect(firsts(host).filter((first) => first === 50000).length).toBe(2);
  });

  it('DAT-048.S5: blocks start at multiples of rows and render over the sparse value', () => {
    const fixture = create((h) => h.deliver(0, LAZY_BLOCK));
    const host = fixture.componentInstance;
    host.events.length = 0;

    expect(rowAt(fixture, 0)!.textContent).toContain('Row 0');
    scrollToRow(fixture, 120);

    expect(host.events.some((event) => event.first === 100 && event.rows === LAZY_BLOCK)).toBe(true);
    expect(rowAt(fixture, 120)!.querySelectorAll('med-skeleton').length).toBe(2);
    scrollToRow(fixture, 0);
    expect(rowAt(fixture, 0)!.textContent).toContain('Row 0');
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows"
      [virtualScroll]="true"
      [virtualScrollItemSize]="40"
      scrollHeight="400px"
      selectionMode="single"
      dataKey="id"
      [rowGroupMode]="rowGroupMode"
      groupRowsBy="team"
      [expandedRowKeys]="expandedRowKeys"
      [frozenValue]="frozen"
      frozenRowsPosition="bottom"
    >
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
      <ng-template #rowexpansion let-row>
        <div class="virtual-expansion">Detail {{ row.name }}</div>
      </ng-template>
      @if (withFooter) {
        <ng-template #footerGroup>
          <tr><td>Footer</td></tr>
        </ng-template>
      }
    </med-data-table>
  `,
})
class VirtualGuardHostComponent {
  rows = makeVirtualRows(VIRTUAL_ROW_COUNT).map((row) => ({ ...row, team: row.id < 500 ? 'A' : 'B' }));
  rowGroupMode: 'subheader' | 'rowspan' | null = null;
  expandedRowKeys: Record<string, boolean> = {};
  withFooter = false;
  frozen: VirtualRow[] | null = null;
}

describe('DataTableComponent virtual scroll guards and edges', () => {
  const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
  const viewport = (fixture: ComponentFixture<unknown>) => root(fixture).querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
  const rowAt = (fixture: ComponentFixture<unknown>, index: number) => root(fixture).querySelector<HTMLElement>(`tbody tr[aria-rowindex="${index + 2}"]`);
  const press = (row: HTMLElement, key: string) => row.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ignores rowGroupMode: no subheader rows between the body rows', () => {
    const fixture = TestBed.createComponent(VirtualGuardHostComponent);
    fixture.componentInstance.rowGroupMode = 'subheader';
    fixture.detectChanges();

    const unpositioned = Array.from(root(fixture).querySelectorAll<HTMLElement>('tbody tr:not([aria-hidden="true"])')).filter((tr) => !tr.hasAttribute('aria-rowindex'));
    expect(unpositioned.length).toBe(0);
    expect(rowAt(fixture, 0)).not.toBeNull();
  });

  it('ignores #rowexpansion: an expanded row renders no expansion row', () => {
    const fixture = TestBed.createComponent(VirtualGuardHostComponent);
    fixture.componentInstance.expandedRowKeys = { '0': true };
    fixture.detectChanges();

    expect(rowAt(fixture, 0)).not.toBeNull();
    expect(root(fixture).querySelector('.virtual-expansion')).toBeNull();
  });

  /** Runs `body` with section heights reported by tag name; jsdom has no layout and never fires ResizeObserver. */
  function withSectionHeights(heights: Record<string, number>, body: () => void): void {
    const originalObserver = globalThis.ResizeObserver;
    const rect = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const height = heights[this.tagName] ?? 0;
      return { height, width: 0, top: 0, left: 0, right: 0, bottom: height, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    // Reports each element once, as soon as it is observed.
    (globalThis as { ResizeObserver: unknown }).ResizeObserver = class {
      constructor(private readonly callback: () => void) {}
      observe(): void {
        this.callback();
      }
      unobserve(): void {}
      disconnect(): void {}
    };
    try {
      body();
    } finally {
      rect.mockRestore();
      (globalThis as { ResizeObserver: unknown }).ResizeObserver = originalObserver;
    }
  }

  /** Focuses the first row, presses End and returns the resulting scroll offset. */
  function endScrollTop(configure: (host: VirtualGuardHostComponent) => void): number {
    const fixture = TestBed.createComponent(VirtualGuardHostComponent);
    configure(fixture.componentInstance);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    fixture.detectChanges();

    const first = rowAt(fixture, 0)!;
    first.focus();
    press(first, 'End');
    fixture.detectChanges();

    expect(document.activeElement).toBe(rowAt(fixture, VIRTUAL_ROW_COUNT - 1));
    return viewport(fixture).scrollTop;
  }

  it('DAT-047.S2: End keeps the last row above a sticky #footerGroup footer', () => {
    const HEADER = 40;
    const FOOTER = 32;
    withSectionHeights({ THEAD: HEADER, TFOOT: FOOTER }, () => {
      // The row's bottom edge sits at the viewport's bottom edge minus the footer: header + 1000 rows - (400 - footer).
      expect(endScrollTop((h) => (h.withFooter = true))).toBe(HEADER + VIRTUAL_ROW_COUNT * 40 - 400 + FOOTER);
    });
  });

  it('DAT-047.S2: bottom frozen rows and the footer overlap, so only the taller one is kept clear', () => {
    const HEADER = 40;
    const FROZEN = 48;
    const FOOTER = 32;
    withSectionHeights({ THEAD: HEADER, TBODY: FROZEN, TFOOT: FOOTER }, () => {
      const top = endScrollTop((h) => {
        h.withFooter = true;
        h.frozen = [{ id: -1, name: 'Pinned', score: -1 }];
      });
      expect(top).toBe(HEADER + VIRTUAL_ROW_COUNT * 40 - 400 + FROZEN);
    });
  });

  it('DAT-047.S3: takes the row count from totalRecords, not from the length of value, in lazy mode', () => {
    const fixture = TestBed.createComponent(VirtualAriaHostComponent);
    fixture.componentInstance.lazy.set(true);
    fixture.componentInstance.totalRecords.set(5000);
    fixture.componentInstance.rows.set(makeVirtualRows(100));
    fixture.detectChanges();

    expect(root(fixture).querySelector('table')!.getAttribute('aria-rowcount')).toBe('5001');
  });
});

describe('DataTableComponent lazy virtual scroll edges', () => {
  const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
  const viewport = (fixture: ComponentFixture<unknown>) => root(fixture).querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
  const rowAt = (fixture: ComponentFixture<unknown>, index: number) => root(fixture).querySelector<HTMLElement>(`tbody tr[aria-rowindex="${index + 2}"]`);

  function scrollToRow(fixture: ComponentFixture<unknown>, index: number): void {
    const element = viewport(fixture);
    element.scrollTop = index * 40;
    element.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('DAT-048: a new rows value discards the requested blocks and scrolls back to the top', () => {
    const fixture = TestBed.createComponent(LazyVirtualHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    scrollToRow(fixture, 50000);
    host.events.length = 0;

    host.blockSize = 100;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(viewport(fixture).scrollTop).toBe(0);
    expect(host.events.some((event) => event.first === 0 && event.rows === 100)).toBe(true);
  });

  it('DAT-048: End onto an unloaded row keeps focus on the current row, then moves it once the data arrives', () => {
    const fixture = TestBed.createComponent(LazyVirtualHostComponent);
    fixture.componentInstance.deliver(0, LAZY_BLOCK);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    const first = rowAt(fixture, 0)!;
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const last = LAZY_TOTAL - 1;
    expect(rowAt(fixture, last)!.getAttribute('tabindex')).toBeNull();
    // The row that had focus left the window but stays rendered and focused, so focus never falls to the page.
    expect(rowAt(fixture, 0)).toBe(first);
    expect(document.activeElement).toBe(first);

    host.deliver(last - (last % LAZY_BLOCK), LAZY_BLOCK);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(document.activeElement).toBe(rowAt(fixture, last));
    expect(rowAt(fixture, 0)).toBeNull();
  });

  it('DAT-048: focus moved elsewhere before the data arrives abandons the pending move', () => {
    const fixture = TestBed.createComponent(LazyVirtualHostComponent);
    fixture.componentInstance.deliver(0, LAZY_BLOCK);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    const first = rowAt(fixture, 0)!;
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    // The user moves focus to another element of the table (here the scroll viewport) before the block arrives.
    const elsewhere = viewport(fixture);
    elsewhere.tabIndex = 0;
    elsewhere.focus();

    const last = LAZY_TOTAL - 1;
    host.deliver(last - (last % LAZY_BLOCK), LAZY_BLOCK);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(document.activeElement).toBe(elsewhere);
  });

  it('DAT-048: when the target scrolled out of the window before its data arrives, the focused row stays rendered and focused', () => {
    const fixture = TestBed.createComponent(LazyVirtualHostComponent);
    fixture.componentInstance.deliver(0, LAZY_BLOCK);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const host = fixture.componentInstance;

    const first = rowAt(fixture, 0)!;
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    // The user scrolls away from the End target, so it is no longer rendered when its block arrives.
    scrollToRow(fixture, 50000);
    const last = LAZY_TOTAL - 1;
    host.deliver(last - (last % LAZY_BLOCK), LAZY_BLOCK);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(rowAt(fixture, last)).toBeNull();
    expect(rowAt(fixture, 0)).toBe(first);
    expect(document.activeElement).toBe(first);
  });
});

interface PagedRow {
  id: number;
  name: string;
}

const makePagedRows = (count: number): PagedRow[] => Array.from({ length: count }, (_, i) => ({ id: i, name: `Item ${i + 1}` }));

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      [paginator]="true"
      [rows]="rowsPerPage()"
      [first]="firstValue()"
      [paginatorPosition]="position()"
      [paginatorAriaLabel]="paginatorLabel()"
      [paginatorTopAriaLabel]="topLabel()"
      [paginatorBottomAriaLabel]="bottomLabel()"
      [showCurrentPageReport]="showReport()"
      [currentPageReportTemplate]="reportTemplate()"
      [showFirstLastIcon]="showFirstLast()"
      [showJumpToPageInput]="showJump()"
      [pageLinks]="pageLinks()"
      [alwaysShowPaginator]="alwaysShow()"
      (pageChange)="events.push($event)"
    >
      <ng-template #caption>Products caption</ng-template>
      <ng-template #summary>Products summary</ng-template>
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class PaginatorOptionsHostComponent {
  rows = signal<PagedRow[]>(makePagedRows(25));
  rowsPerPage = signal(10);
  firstValue = signal(0);
  position = signal<'top' | 'bottom' | 'both'>('bottom');
  paginatorLabel = signal('Pagination');
  topLabel = signal('Pagination, top');
  bottomLabel = signal('Pagination, bottom');
  showReport = signal(true);
  reportTemplate = signal<string | null>(null);
  showFirstLast = signal(false);
  showJump = signal(false);
  pageLinks = signal(5);
  alwaysShow = signal(true);
  events: unknown[] = [];
}

describe('DataTableComponent paginator position and options (DAT-049)', () => {
  function create(configure?: (host: PaginatorOptionsHostComponent) => void): ComponentFixture<PaginatorOptionsHostComponent> {
    const fixture = TestBed.createComponent(PaginatorOptionsHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  const paginatorsOf = (fixture: ComponentFixture<PaginatorOptionsHostComponent>): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('med-paginator')) as HTMLElement[];
  const navsOf = (fixture: ComponentFixture<PaginatorOptionsHostComponent>): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('med-paginator nav')) as HTMLElement[];
  const bodyRowsOf = (fixture: ComponentFixture<PaginatorOptionsHostComponent>): HTMLTableRowElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
  const clickPage = (fixture: ComponentFixture<PaginatorOptionsHostComponent>, paginator: HTMLElement, page: number): void => {
    paginator.querySelector<HTMLButtonElement>(`button[aria-label="Page ${page}"]`)!.click();
    fixture.detectChanges();
  };

  it('DAT-049.S1: paginator above the table renders after the caption and before the table header', () => {
    const fixture = create((h) => h.position.set('top'));
    const el = fixture.nativeElement as HTMLElement;

    const paginators = paginatorsOf(fixture);
    expect(paginators.length).toBe(1);
    const caption = el.querySelector('[data-med-caption]')!;
    const header = el.querySelector('thead')!;
    expect(caption.compareDocumentPosition(paginators[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(paginators[0].compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('DAT-049.S2: both paginators stay in step when the page changes in the top one', () => {
    const fixture = create((h) => h.position.set('both'));
    const [top, bottom] = paginatorsOf(fixture);

    clickPage(fixture, top, 3);

    const rows = bodyRowsOf(fixture).map((tr) => tr.textContent ?? '');
    expect(rows.length).toBe(5);
    expect(rows[0]).toContain('Item 21');
    expect(rows[4]).toContain('Item 25');
    expect(bottom.querySelector('[aria-current="page"]')!.textContent!.trim()).toBe('3');
  });

  it('DAT-049.S3: the two paginators of a both table have distinct landmark names', () => {
    const fixture = create((h) => h.position.set('both'));
    const [top, bottom] = navsOf(fixture);

    expect(top.getAttribute('aria-label')).toBe('Pagination, top');
    expect(bottom.getAttribute('aria-label')).toBe('Pagination, bottom');
  });

  it('DAT-049.S3: paginatorTopAriaLabel renames the top paginator', () => {
    const fixture = create((h) => {
      h.position.set('both');
      h.topLabel.set('Pages above');
    });

    expect(navsOf(fixture)[0].getAttribute('aria-label')).toBe('Pages above');
  });

  it('DAT-049.S4: currentPageReportTemplate replaces its placeholders', () => {
    const fixture = create((h) => {
      h.firstValue.set(10);
      h.reportTemplate.set('Page {currentPage} of {totalPages}, rows {first}-{last} of {totalRecords} ({rows} per page)');
    });

    expect(navsOf(fixture)[0].textContent).toContain('Page 2 of 3, rows 11-20 of 25 (10 per page)');
  });

  it('DAT-049.S5: showCurrentPageReport false hides the page report', () => {
    const fixture = create((h) => h.showReport.set(false));

    expect(paginatorsOf(fixture).length).toBe(1);
    expect(navsOf(fixture)[0].textContent).not.toContain('Showing');
  });

  it('DAT-049.S6: showFirstLastIcon, showJumpToPageInput and pageLinks are forwarded to the paginator', () => {
    const fixture = create((h) => {
      h.rows.set(makePagedRows(200));
      h.showFirstLast.set(true);
      h.showJump.set(true);
      h.pageLinks.set(3);
    });
    const paginator = paginatorsOf(fixture)[0];

    expect(paginator.querySelector('button[aria-label="First page"]')).not.toBeNull();
    expect(paginator.querySelector('button[aria-label="Last page"]')).not.toBeNull();
    expect(paginator.querySelector('input[type="number"]')).not.toBeNull();
    expect(paginator.querySelectorAll('button[aria-label^="Page "]').length).toBe(3);
  });

  it('DAT-049.S7: alwaysShowPaginator false renders no paginator for a single page; the default still renders one', () => {
    const hidden = create((h) => {
      h.rows.set(makePagedRows(8));
      h.alwaysShow.set(false);
    });
    expect(hidden.nativeElement.querySelector('med-paginator')).toBeNull();

    const shown = create((h) => h.rows.set(makePagedRows(8)));
    expect(shown.nativeElement.querySelector('med-paginator')).not.toBeNull();
  });

  it('DAT-049.S8: pageChange emits once for a user page change and not for a host-written first', () => {
    const fixture = create();
    const host = fixture.componentInstance;

    clickPage(fixture, paginatorsOf(fixture)[0], 2);

    expect(host.events).toEqual([{ first: 10, rows: 10, page: 1, pageCount: 3 }]);

    host.firstValue.set(20);
    fixture.detectChanges();

    expect(host.events.length).toBe(1);
  });

  it('DAT-049.S9: default placement is one paginator after the summary, named "Pagination", with the Showing report', () => {
    const fixture = create((h) => h.position.set('bottom'));
    const el = fixture.nativeElement as HTMLElement;

    const paginators = paginatorsOf(fixture);
    expect(paginators.length).toBe(1);
    const summary = el.querySelector('[data-med-summary]')!;
    expect(summary.compareDocumentPosition(paginators[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(navsOf(fixture)[0].getAttribute('aria-label')).toBe('Pagination');
    expect(navsOf(fixture)[0].textContent).toContain('Showing 1-10 of 25');
  });
});

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="rows" [paginator]="true" [rows]="10" [lazy]="lazy" [totalRecords]="25" (pageChange)="events.push($event)">
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class PaginatorDefaultsHostComponent {
  rows = makePagedRows(25);
  lazy = false;
  events: unknown[] = [];
}

describe('DataTableComponent paginator defaults and lazy pageChange (DAT-049)', () => {
  it('DAT-049.S3/S7/S9: with every paginator input left unset the table keeps its documented defaults', () => {
    const fixture = TestBed.createComponent(PaginatorDefaultsHostComponent);
    fixture.componentInstance.rows = makePagedRows(8);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const navs = el.querySelectorAll('med-paginator nav');
    expect(navs.length).toBe(1);
    expect(navs[0].getAttribute('aria-label')).toBe('Pagination');
    expect(navs[0].textContent).toContain('Showing 1-8 of 8');
  });

  it('DAT-049.S8: pageChange also emits when lazy is on', () => {
    const fixture = TestBed.createComponent(PaginatorDefaultsHostComponent);
    fixture.componentInstance.lazy = true;
    fixture.componentInstance.rows = makePagedRows(10);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('med-paginator button[aria-label="Page 2"]')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.events).toEqual([{ first: 10, rows: 10, page: 1, pageCount: 3 }]);
  });
});

/**
 * Controllable `window.matchMedia` for the responsive stack. jsdom has no media queries, so this mock
 * evaluates the `(width < Npx)` form the table builds from `breakpoint` against a width the test sets,
 * and fires `change` on every registered list when the test resizes the viewport.
 */
type MediaChangeListener = (event: { matches: boolean; media: string }) => void;

class ViewportMock {
  width = 1280;
  private readonly lists: { media: string; matches: boolean; listeners: Set<MediaChangeListener> }[] = [];

  install(): void {
    this.width = 1280;
    this.lists.length = 0;
    window.matchMedia = jest.fn((media: string) => {
      const entry = { media, matches: this.matches(media), listeners: new Set<MediaChangeListener>() };
      this.lists.push(entry);
      return {
        media,
        onchange: null,
        get matches() {
          return entry.matches;
        },
        addEventListener: (_type: string, listener: MediaChangeListener) => entry.listeners.add(listener),
        removeEventListener: (_type: string, listener: MediaChangeListener) => entry.listeners.delete(listener),
        addListener: (listener: MediaChangeListener) => entry.listeners.add(listener),
        removeListener: (listener: MediaChangeListener) => entry.listeners.delete(listener),
        dispatchEvent: () => true,
      } as unknown as MediaQueryList;
    }) as unknown as typeof window.matchMedia;
  }

  uninstall(): void {
    delete (window as { matchMedia?: unknown }).matchMedia;
    this.lists.length = 0;
  }

  resize(width: number): void {
    this.width = width;
    for (const entry of this.lists) {
      entry.matches = this.matches(entry.media);
      for (const listener of entry.listeners) {
        listener({ matches: entry.matches, media: entry.media });
      }
    }
  }

  private matches(media: string): boolean {
    const match = /\(width\s*<\s*(\d+(?:\.\d+)?)px\)/.exec(media);
    return match ? this.width < Number(match[1]) : false;
  }
}

interface StackPerson {
  name: string;
  role: string;
  team: string;
}

const STACK_PEOPLE: StackPerson[] = [
  { name: 'Ada', role: 'Engineer', team: 'Analytical' },
  { name: 'Grace', role: 'Admiral', team: 'Analytical' },
  { name: 'Alan', role: 'Engineer', team: 'Logic' },
];

/** Shared column markup for the stack hosts; each optional piece is switched by a host flag. */
const STACK_COLUMNS = `
  <med-table-column field="name" header="Name" [sortable]="true" [frozen]="nameFrozen" [stackLabel]="nameLabel" [editable]="true">
    <ng-template let-row>{{ row.name }}</ng-template>
    <ng-template #editTemplate let-row let-onSave="onSave" let-onCancel="onCancel">
      <input class="edit-input" [value]="row.name" (keydown.enter)="onSave($any($event.target).value)" (keydown.escape)="onCancel()" />
    </ng-template>
  </med-table-column>
  <med-table-column field="role" [header]="roleHeader" [visible]="roleVisible">
    <ng-template let-row>{{ row.role }}</ng-template>
  </med-table-column>
  @if (showTeam) {
    <med-table-column field="team" header="Team">
      <ng-template let-row>{{ row.team }}</ng-template>
    </med-table-column>
  }
  @if (showHeaderGroup) {
    <ng-template #headerGroup><tr><th colspan="3">Group</th></tr></ng-template>
  }
  @if (showExpansion) {
    <ng-template #rowexpansion let-row><div class="expanded-detail">Detail: {{ row.name }}</div></ng-template>
  }
`;

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      class="consumer-table"
      [value]="people"
      [responsiveLayout]="responsiveLayout"
      [breakpoint]="breakpoint"
      [virtualScroll]="virtualScroll"
      [selectionMode]="selectionMode"
      [(selection)]="selection"
      [reorderable]="reorderable"
      [resizableColumns]="resizableColumns"
      [reorderableColumns]="reorderableColumns"
      [rowGroupMode]="rowGroupMode"
      [groupRowsBy]="groupRowsBy"
      [editMode]="editMode"
      [scrollable]="scrollable"
      [scrollHeight]="scrollHeight"
      [frozenValue]="frozenValue"
      [sortField]="sortField"
      [sortOrder]="sortOrder"
      [dataKey]="dataKey"
      [(expandedRowKeys)]="expandedRowKeys"
      (sort)="onSort($event)"
      ariaLabel="People"
    >
      ${STACK_COLUMNS}
    </med-data-table>
  `,
})
class StackHostComponent {
  people: StackPerson[] = STACK_PEOPLE;
  responsiveLayout: 'scroll' | 'stack' = 'stack';
  breakpoint = '960px';
  virtualScroll = false;
  selectionMode: 'multiple' | null = null;
  selection: StackPerson[] = [];
  reorderable = false;
  resizableColumns = false;
  reorderableColumns = false;
  rowGroupMode: 'subheader' | 'rowspan' | null = null;
  groupRowsBy: string | null = null;
  editMode: 'row' | null = null;
  scrollable = false;
  scrollHeight: string | null = null;
  frozenValue: StackPerson[] | null = null;
  sortField: string | null = null;
  sortOrder: 'asc' | 'desc' | null = null;
  dataKey: string | null = null;
  expandedRowKeys: Record<string, boolean> = {};
  nameFrozen = false;
  nameLabel: string | null = null;
  roleHeader = 'Role';
  roleVisible = true;
  showTeam = false;
  showHeaderGroup = false;
  showExpansion = false;
  onSort = jest.fn();
}

/** No layout input bound at all, so `responsiveLayout`, `breakpoint` and `stackLabel` keep their defaults. */
@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="people">
      <med-table-column field="name" header="Name" />
      <med-table-column field="role" header="Role" />
    </med-data-table>
  `,
})
class UnsetLayoutHostComponent {
  people = STACK_PEOPLE;
}

/** `responsiveLayout="stack"` with `breakpoint` left unset, so the 960px default applies. */
@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="people" responsiveLayout="stack">
      <med-table-column field="name" header="Name" />
      <med-table-column field="role" header="Role" />
    </med-data-table>
  `,
})
class StackOnlyHostComponent {
  people = STACK_PEOPLE;
}

function stackHeaderCells(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('thead th'));
}

function stackBodyRows(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('tbody tr'));
}

function stackTable(root: HTMLElement): HTMLTableElement {
  return root.querySelector('table') as HTMLTableElement;
}

/** Stack labels are the `aria-hidden` element that is a direct child of a body cell. */
function stackLabel(cell: HTMLElement): HTMLElement | null {
  return cell.querySelector<HTMLElement>(':scope > [aria-hidden="true"]');
}

function stackLabelTexts(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>('tbody td > [aria-hidden="true"]')).map((label) => label.textContent?.trim() ?? '');
}

/** A cell's value without its stack label. */
function stackCellValue(cell: HTMLElement): string {
  const clone = cell.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
  return clone.textContent?.trim() ?? '';
}

function stackCells(row: HTMLElement): HTMLElement[] {
  return Array.from(row.querySelectorAll<HTMLElement>('td'));
}

function createStackTable(configure?: (host: StackHostComponent) => void): ComponentFixture<StackHostComponent> {
  const fixture = TestBed.createComponent(StackHostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('DataTableComponent responsive stack (DAT-050 to DAT-052)', () => {
  const viewport = new ViewportMock();

  beforeEach(() => viewport.install());
  afterEach(() => viewport.uninstall());

  describe('layout (DAT-050)', () => {
    it('DAT-050.S1: with responsiveLayout, breakpoint and stackLabel unset, the table keeps the scroll layout at 400px', () => {
      viewport.resize(400);
      const fixture = TestBed.createComponent(UnsetLayoutHostComponent);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;

      expect(stackTable(root).getAttribute('role')).toBeNull();
      expect(stackLabelTexts(root)).toEqual([]);
      expect(root.querySelector('[data-med-scroll-viewport]')?.classList.contains('overflow-x-auto')).toBe(true);
    });

    it('DAT-050.S2: stack mode with the default breakpoint labels each cell with its header at 800px', () => {
      viewport.resize(800);
      const fixture = TestBed.createComponent(StackOnlyHostComponent);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      // Each row being a block is a CSS rule jsdom cannot measure; the e2e spec verifies the geometry at 400px.
      const rows = stackBodyRows(root);

      expect(rows.map((row) => stackCells(row).map((cell) => stackLabel(cell)?.textContent?.trim()))).toEqual([
        ['Name', 'Role'],
        ['Name', 'Role'],
        ['Name', 'Role'],
      ]);
      expect(rows.map((row) => stackCells(row).map(stackCellValue))).toEqual([
        ['Ada', 'Engineer'],
        ['Grace', 'Admiral'],
        ['Alan', 'Engineer'],
      ]);
    });

    it('DAT-050.S3: a viewport exactly at the breakpoint stays unstacked at 600px', () => {
      viewport.resize(600);
      const fixture = createStackTable((host) => {
        host.breakpoint = '600px';
      });
      const root = fixture.nativeElement as HTMLElement;

      expect(stackTable(root).getAttribute('role')).toBeNull();
      expect(stackLabelTexts(root)).toEqual([]);
    });

    it('DAT-050.S4: the table unstacks at 1200px and stacks again at 800px without being re-created', () => {
      viewport.resize(800);
      const fixture = createStackTable();
      const root = fixture.nativeElement as HTMLElement;
      const table = stackTable(root);
      expect(stackLabelTexts(root).length).toBeGreaterThan(0);

      viewport.resize(1200);
      fixture.detectChanges();
      expect(stackLabelTexts(root)).toEqual([]);

      viewport.resize(800);
      fixture.detectChanges();
      expect(stackLabelTexts(root).length).toBeGreaterThan(0);
      expect(stackTable(root)).toBe(table);
    });

    it('DAT-050.S5: a stackLabel overrides the header and a column with neither shows no label', () => {
      viewport.resize(800);
      const fixture = createStackTable((host) => {
        host.nameLabel = 'Full name';
        host.roleHeader = '';
      });
      const rows = stackBodyRows(fixture.nativeElement as HTMLElement);

      for (const row of rows) {
        const cells = stackCells(row);
        expect(stackLabel(cells[0])?.textContent?.trim()).toBe('Full name');
        expect(stackLabel(cells[1])).toBeNull();
      }
    });

    it('DAT-050.S6: an invalid breakpoint and virtualScroll each keep the table unstacked at 400px', () => {
      viewport.resize(400);
      const invalid = createStackTable((host) => {
        host.breakpoint = 'wide';
      });
      expect(stackTable(invalid.nativeElement).getAttribute('role')).toBeNull();
      expect(stackLabelTexts(invalid.nativeElement)).toEqual([]);

      const virtual = createStackTable((host) => {
        host.virtualScroll = true;
      });
      expect(stackTable(virtual.nativeElement).getAttribute('role')).toBeNull();
      expect(stackLabelTexts(virtual.nativeElement)).toEqual([]);
    });
  });

  describe('semantics and appearance (DAT-051)', () => {
    it('DAT-051.S1: a stacked table with two columns and one row carries explicit table, rowgroup, row, columnheader and cell roles', () => {
      viewport.resize(800);
      const fixture = createStackTable((host) => {
        host.people = [STACK_PEOPLE[0]];
      });
      const root = fixture.nativeElement as HTMLElement;

      expect(stackTable(root).getAttribute('role')).toBe('table');
      root.querySelectorAll('thead, tbody').forEach((group) => expect(group.getAttribute('role')).toBe('rowgroup'));
      expect(root.querySelector('thead tr')?.getAttribute('role')).toBe('row');
      expect(stackBodyRows(root).map((row) => row.getAttribute('role'))).toEqual(['row']);
      expect(stackHeaderCells(root).map((th) => th.getAttribute('role'))).toEqual(['columnheader', 'columnheader']);
      expect(stackCells(stackBodyRows(root)[0]).map((td) => td.getAttribute('role'))).toEqual(['cell', 'cell']);
    });

    it('DAT-051.S2: the header row stays in the DOM and accessibility tree but is visually hidden and takes no space', () => {
      viewport.resize(800);
      const fixture = createStackTable();
      const headerRow = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('thead tr')!;

      expect(headerRow.isConnected).toBe(true);
      expect(getComputedStyle(headerRow).display).not.toBe('none');
      expect(headerRow.getAttribute('aria-hidden')).not.toBe('true');
      expect(headerRow.classList.contains('sr-only')).toBe(true);
    });

    it('DAT-051.S3: the label of a body cell is aria-hidden', () => {
      viewport.resize(800);
      const fixture = createStackTable();
      const firstCell = stackCells(stackBodyRows(fixture.nativeElement as HTMLElement)[0])[0];
      const label = stackLabel(firstCell);

      expect(label?.getAttribute('aria-hidden')).toBe('true');
      expect(label?.textContent?.trim()).toBe('Name');
    });

    it('DAT-051.S4: at or above the breakpoint no stack roles and no labels are present', () => {
      viewport.resize(1200);
      const fixture = createStackTable();
      const root = fixture.nativeElement as HTMLElement;

      expect(stackTable(root).getAttribute('role')).toBeNull();
      expect(root.querySelectorAll('[role="row"], [role="cell"], [role="columnheader"]')).toHaveLength(0);
      expect(stackLabelTexts(root)).toEqual([]);
    });

    it('DAT-051.S5: row separators, label text and row background carry dark-scheme tokens, and the consumer class merges onto the root', () => {
      viewport.resize(800);
      const fixture = createStackTable();
      const root = fixture.nativeElement as HTMLElement;
      // Light and dark colours are CSS; the unit test checks the paired token classes, the e2e spec checks computed colours.
      const row = stackBodyRows(root)[0];
      const label = stackLabel(stackCells(row)[0])!;

      expect(row.className).toMatch(/dark:border-surface-/);
      expect(row.className).toMatch(/dark:bg-surface-/);
      expect(label.className).toMatch(/text-surface-/);
      expect(label.className).toMatch(/dark:text-surface-/);
      expect(root.querySelector('div.consumer-table')?.classList.contains('rounded-lg')).toBe(true);
    });
  });

  describe('other features while stacked (DAT-052)', () => {
    it('DAT-052.S1: header clicks and Enter do not sort, the header leaves the tab order and keeps aria-sort', () => {
      viewport.resize(800);
      const fixture = createStackTable((host) => {
        host.sortField = 'name';
        host.sortOrder = 'asc';
      });
      const root = fixture.nativeElement as HTMLElement;
      const nameHeader = stackHeaderCells(root)[0];

      nameHeader.click();
      nameHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      expect(fixture.componentInstance.onSort).not.toHaveBeenCalled();
      expect(fixture.componentInstance.sortOrder).toBe('asc');
      expect(['-1', null]).toContain(nameHeader.getAttribute('tabindex'));
      expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
    });

    it('DAT-052.S2: frozen column and frozen row are not sticky, appear in normal order and are labelled', () => {
      viewport.resize(800);
      const fixture = createStackTable((host) => {
        host.nameFrozen = true;
        host.frozenValue = [{ name: 'Total', role: 'All', team: '-' }];
      });
      const root = fixture.nativeElement as HTMLElement;
      const rows = stackBodyRows(root);

      expect(root.querySelectorAll('.sticky')).toHaveLength(0);
      expect(rows.map((row) => stackCellValue(stackCells(row)[0]))).toEqual(['Total', 'Ada', 'Grace', 'Alan']);
      expect(stackLabel(stackCells(rows[0])[0])?.textContent?.trim()).toBe('Name');
    });

    it('DAT-052.S3: resize handles and draggable headers are gone and the hidden column renders nothing', () => {
      viewport.resize(800);
      const fixture = createStackTable((host) => {
        host.resizableColumns = true;
        host.reorderableColumns = true;
        host.roleVisible = false;
      });
      const root = fixture.nativeElement as HTMLElement;

      expect(root.querySelectorAll('[data-col-resize-handle="true"]')).toHaveLength(0);
      expect(root.querySelectorAll('thead th[draggable="true"]')).toHaveLength(0);
      expect(stackHeaderCells(root).map((th) => th.textContent?.trim())).toEqual(['Name']);
      expect(stackBodyRows(root).map((row) => stackCells(row).length)).toEqual([1, 1, 1]);
    });

    it('DAT-052.S4: checking and expanding a row selects it, hides its checkbox label and drops the reorder handle; the expansion spans the row', () => {
      viewport.resize(800);
      const fixture = createStackTable((host) => {
        host.selectionMode = 'multiple';
        host.reorderable = true;
        host.showExpansion = true;
        host.dataKey = 'name';
        host.expandedRowKeys = { Ada: true };
      });
      const root = fixture.nativeElement as HTMLElement;
      const checkbox = root.querySelector<HTMLInputElement>('tbody tr input[type="checkbox"]')!;
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      const firstRow = stackBodyRows(root)[0];
      expect(fixture.componentInstance.selection.map((person) => person.name)).toEqual(['Ada']);
      expect(firstRow.getAttribute('aria-selected')).toBe('true');
      expect(stackLabel(stackCells(firstRow)[0])).toBeNull();
      expect(root.querySelectorAll('tbody med-icon[name="bars-3"]')).toHaveLength(0);

      const expansionCell = root.querySelector('.expanded-detail')!.closest('td') as HTMLTableCellElement;
      expect(firstRow.nextElementSibling?.contains(expansionCell)).toBe(true);
      expect(expansionCell.colSpan).toBe(stackHeaderCells(root).length);
    });

    it('DAT-052.S5: a subheader row spans the full width, and a row-span table shows the group value in every row with no merged cell', () => {
      viewport.resize(800);
      const subheader = createStackTable((host) => {
        host.showTeam = true;
        host.rowGroupMode = 'subheader';
        host.groupRowsBy = 'team';
      });
      const groupRows = Array.from((subheader.nativeElement as HTMLElement).querySelectorAll<HTMLTableCellElement>('tbody td[colspan]'));

      expect(groupRows).toHaveLength(2);
      expect(groupRows.map((cell) => cell.colSpan)).toEqual([3, 3]);

      const rowspan = createStackTable((host) => {
        host.showTeam = true;
        host.rowGroupMode = 'rowspan';
        host.groupRowsBy = 'team';
      });
      const root = rowspan.nativeElement as HTMLElement;

      expect(root.querySelectorAll('tbody td[rowspan]')).toHaveLength(0);
      expect(stackBodyRows(root).map((row) => stackCellValue(stackCells(row)[2]))).toEqual(['Analytical', 'Analytical', 'Logic']);
    });

    it('DAT-052.S6: the body scrolls within 300px with a header that is not sticky, and the header group is visually hidden and labels nothing', () => {
      viewport.resize(800);
      const fixture = createStackTable((host) => {
        host.scrollable = true;
        host.scrollHeight = '300px';
        host.showHeaderGroup = true;
      });
      const root = fixture.nativeElement as HTMLElement;
      const scrollViewport = root.querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
      const groupRow = Array.from(root.querySelectorAll<HTMLElement>('thead tr')).find((tr) => tr.textContent?.includes('Group'))!;

      expect(scrollViewport.style.maxHeight).toBe('300px');
      expect(scrollViewport.classList.contains('overflow-y-auto')).toBe(true);
      expect(root.querySelector('thead')?.className).not.toContain('sticky');
      expect(groupRow.classList.contains('sr-only')).toBe(true);
      expect(stackLabelTexts(root)).not.toContain('Group');
    });

    it('DAT-052.S7: editing shows the edit template under the label, and the actions cell keeps its buttons with no label', () => {
      viewport.resize(800);
      const fixture = createStackTable((host) => {
        host.editMode = 'row';
      });
      const root = fixture.nativeElement as HTMLElement;
      root.querySelector<HTMLButtonElement>('tbody button[aria-label="Edit row"]')!.click();
      fixture.detectChanges();

      const firstRow = stackBodyRows(root)[0];
      const nameCell = stackCells(firstRow)[0];
      const input = nameCell.querySelector('.edit-input')!;
      const label = stackLabel(nameCell)!;
      expect(label.textContent?.trim()).toBe('Name');
      expect(label.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

      const actionsCell = stackCells(firstRow).at(-1)!;
      expect(actionsCell.querySelectorAll('button').length).toBeGreaterThan(0);
      expect(stackLabel(actionsCell)).toBeNull();
    });

    it('DAT-052.S8: widening past the breakpoint restores the sticky column, the sort click and the resize handle', () => {
      viewport.resize(800);
      const fixture = createStackTable((host) => {
        host.nameFrozen = true;
        host.resizableColumns = true;
      });
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelectorAll('[data-col-resize-handle="true"]')).toHaveLength(0);

      viewport.resize(1000);
      fixture.detectChanges();

      expect(stackCells(stackBodyRows(root)[0])[0].classList.contains('sticky')).toBe(true);
      stackHeaderCells(root)[0].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.onSort).toHaveBeenCalled();
      expect(root.querySelector('[data-col-resize-handle="true"]')).not.toBeNull();
    });
  });
});
