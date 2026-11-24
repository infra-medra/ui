import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { IconComponent } from '../icon/icon.component';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableColumnFilters } from './data-table.types';

interface RowItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  released: Date;
}

const ITEMS: RowItem[] = [
  { id: '1', name: 'Widget', category: 'A', price: 10, stock: 5, released: new Date(2026, 0, 1) },
  { id: '2', name: 'Gadget', category: 'B', price: 25, stock: 0, released: new Date(2026, 0, 15) },
  { id: '3', name: 'Widget Pro', category: 'A', price: 50, stock: 12, released: new Date(2026, 1, 1) },
];

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="items"
      [filterDisplay]="filterDisplay"
      [selectionMode]="selectionMode"
      [reorderable]="reorderable"
      [editMode]="editMode"
      [paginator]="paginator"
      [rows]="rows"
      [(first)]="first"
      [(columnFilters)]="columnFilters"
      [responsiveLayout]="responsiveLayout"
      breakpoint="600px"
      (filter)="onFilter($event)"
      ariaLabel="Filter row items"
    >
      <med-table-column field="name" header="Name" columnFilter />
      <med-table-column field="price" header="Price" columnFilter filterType="numeric" filterMatchMode="gte" />
      <med-table-column field="released" header="Released" columnFilter filterType="date" />
      <med-table-column field="stock" header="Stock" />
    </med-data-table>
  `,
})
class FilterRowHostComponent {
  items = ITEMS;
  filterDisplay: 'menu' | 'row' = 'row';
  selectionMode: 'multiple' | null = null;
  reorderable = false;
  editMode: 'row' | null = null;
  paginator = false;
  rows = 2;
  first = signal(0);
  columnFilters = signal<TableColumnFilters>({});
  responsiveLayout: 'scroll' | 'stack' = 'scroll';
  onFilter = jest.fn();
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="items"
      [filterDisplay]="filterDisplay"
      [(columnFilters)]="columnFilters"
      (filter)="onFilter($event)"
      ariaLabel="Custom filter template"
    >
      <med-table-column field="name" header="Name" columnFilter [filterMatchMode]="'equals'">
        <ng-template #filter let-value let-filter="filter" let-clear="clear" let-matchMode="matchMode">
          <div data-custom-filter [attr.data-value]="value ?? ''" [attr.data-match-mode]="matchMode">
            <button type="button" data-custom-apply (click)="filter('Widget')">Pick Widget</button>
            <button type="button" data-custom-clear (click)="clear()">Reset</button>
          </div>
        </ng-template>
      </med-table-column>
      <med-table-column field="stock" header="Stock" />
    </med-data-table>
  `,
})
class CustomFilterTemplateHostComponent {
  items = ITEMS;
  filterDisplay: 'menu' | 'row' = 'row';
  columnFilters = signal<TableColumnFilters>({});
  onFilter = jest.fn();
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="items" [filterDisplay]="filterDisplay()" [(columnFilters)]="columnFilters" ariaLabel="Filter options">
      <med-table-column field="category" header="Category" columnFilter filterMatchMode="in" [filterOptions]="categoryOptions" />
    </med-data-table>
  `,
})
class FilterOptionsHostComponent {
  items = ITEMS;
  filterDisplay = signal<'menu' | 'row'>('menu');
  categoryOptions: readonly unknown[] = ['A', 'B', 'Custom'];
  columnFilters = signal<TableColumnFilters>({});
}

function bodyRows(fixture: ComponentFixture<unknown>): HTMLTableRowElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
}

function rowNames(fixture: ComponentFixture<unknown>): string[] {
  return bodyRows(fixture).map((tr) => tr.querySelector('td')?.textContent?.trim() ?? '');
}

function headRows(fixture: ComponentFixture<unknown>): HTMLTableRowElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('thead tr'));
}

describe('DataTable filter row and custom #filter template (DAT-057)', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  describe('DAT-057.S1 inline filter row below headers', () => {
    function createRowHost(setup?: (host: FilterRowHostComponent) => void): ComponentFixture<FilterRowHostComponent> {
      const fixture = TestBed.createComponent(FilterRowHostComponent);
      setup?.(fixture.componentInstance);
      fixture.detectChanges();
      return fixture;
    }

    it('DAT-057.S1 defaults filterDisplay to "menu" with a single header row and funnel buttons', () => {
      const fixture = createRowHost((h) => (h.filterDisplay = 'menu'));
      expect(headRows(fixture)).toHaveLength(1);
      expect(fixture.nativeElement.querySelector('thead th button[aria-label="Filter Name"]')).not.toBeNull();
    });

    it('DAT-057.S1 renders a filter row inside thead directly below headers, with empty cells for utility and non-filterable columns and no funnel buttons', () => {
      const fixture = createRowHost((h) => {
        h.selectionMode = 'multiple';
        h.reorderable = true;
        h.editMode = 'row';
      });

      const rows = headRows(fixture);
      expect(rows).toHaveLength(2);
      const headerCells = Array.from(rows[0].children) as HTMLElement[];
      const filterCells = Array.from(rows[1].children) as HTMLElement[];
      expect(filterCells).toHaveLength(headerCells.length);

      // No funnel buttons in header row when filterDisplay="row".
      expect(rows[0].querySelector('button[aria-label^="Filter "]')).toBeNull();

      // Utility cells (reorder + selection) are empty.
      expect(filterCells[0].querySelector('input, med-date-picker')).toBeNull();
      expect(filterCells[1].querySelector('input, med-date-picker')).toBeNull();

      // Filterable columns (name, price, released) have controls; stock does not; row actions utility cell is empty.
      expect(filterCells[2].querySelector('input[type="text"]')).not.toBeNull();
      expect(filterCells[3].querySelector('input[type="number"]')).not.toBeNull();
      expect(filterCells[4].querySelector('med-date-picker')).not.toBeNull();
      expect(filterCells[5].querySelector('input, med-date-picker')).toBeNull();
      expect(filterCells[6].querySelector('input, med-date-picker')).toBeNull();
    });

    it('DAT-057.S1 typing "wid" in the name filter row input filters immediately without opening a popover, updates columnFilters, and emits filter', () => {
      const fixture = createRowHost((h) => {
        h.paginator = true;
        h.rows = 2;
        h.first.set(2);
      });
      const host = fixture.componentInstance;
      host.onFilter.mockClear();

      const filterRow = headRows(fixture)[1];
      const nameInput = filterRow.querySelector('input[type="text"]') as HTMLInputElement;
      expect(nameInput).not.toBeNull();

      nameInput.value = 'wid';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      expect(document.querySelector('.cdk-overlay-pane[role="dialog"]')).toBeNull();
      expect(rowNames(fixture)).toEqual(['Widget', 'Widget Pro']);
      expect(host.columnFilters()).toEqual({ name: { matchMode: 'contains', value: 'wid' } });
      expect(host.first()).toBe(0);
      expect(host.onFilter).toHaveBeenCalledTimes(1);
      expect(host.onFilter).toHaveBeenCalledWith({ value: '', data: [ITEMS[0], ITEMS[2]] });

      // Clearing the input removes the column filter.
      nameInput.value = '';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      expect(host.columnFilters()).toEqual({});
    });

    it('DAT-057.S1 numeric filter row input filters rows immediately', () => {
      const fixture = createRowHost();
      const filterRow = headRows(fixture)[1];
      const priceInput = filterRow.querySelector('input[type="number"]') as HTMLInputElement;
      priceInput.value = '25';
      priceInput.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Gadget', 'Widget Pro']);
      expect(fixture.componentInstance.columnFilters()).toEqual({ price: { matchMode: 'gte', value: 25 } });
    });

    it('DAT-057.S1 omits the filter row when the table is stacked', () => {
      const originalMatchMedia = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: true,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      try {
        const fixture = createRowHost((h) => (h.responsiveLayout = 'stack'));
        expect(headRows(fixture)).toHaveLength(1);
      } finally {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          configurable: true,
          value: originalMatchMedia,
        });
      }
    });
  });

  describe('DAT-057.S2 custom #filter template in row and menu modes', () => {
    it('DAT-057.S2 renders #filter instead of default control in filterDisplay="row", keeping body cell rendering intact', () => {
      const fixture = TestBed.createComponent(CustomFilterTemplateHostComponent);
      fixture.componentInstance.filterDisplay = 'row';
      fixture.detectChanges();

      // Body cells still display row[field] (not hijacked by #filter).
      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);

      const filterRow = headRows(fixture)[1];
      expect(filterRow).toBeDefined();
      expect(filterRow.querySelector('input')).toBeNull();

      const custom = filterRow.querySelector('[data-custom-filter]') as HTMLElement;
      expect(custom).not.toBeNull();
      expect(custom.getAttribute('data-match-mode')).toBe('equals');
      expect(custom.getAttribute('data-value')).toBe('');

      (filterRow.querySelector('[data-custom-apply]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Widget']);
      expect(fixture.componentInstance.columnFilters()).toEqual({ name: { matchMode: 'equals', value: 'Widget' } });
      expect(custom.getAttribute('data-value')).toBe('Widget');
      expect(fixture.componentInstance.onFilter).toHaveBeenCalled();

      (filterRow.querySelector('[data-custom-clear]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
      expect(fixture.componentInstance.columnFilters()).toEqual({});
    });

    it('DAT-057.S2 renders #filter instead of default controls in filterDisplay="menu" and supports filter(value) and clear()', () => {
      const fixture = TestBed.createComponent(CustomFilterTemplateHostComponent);
      fixture.componentInstance.filterDisplay = 'menu';
      fixture.detectChanges();

      const funnelBtn = fixture.nativeElement.querySelector('thead th button[aria-label="Filter Name"]') as HTMLButtonElement;
      expect(funnelBtn).not.toBeNull();
      funnelBtn.click();
      fixture.detectChanges();

      const dialog = document.querySelector('.cdk-overlay-pane[role="dialog"]') as HTMLElement;
      expect(dialog).not.toBeNull();
      expect(dialog.querySelector('input')).toBeNull();
      expect(dialog.querySelector('[role="combobox"]')).toBeNull();

      const custom = dialog.querySelector('[data-custom-filter]') as HTMLElement;
      expect(custom).not.toBeNull();
      expect(custom.getAttribute('data-match-mode')).toBe('equals');

      (dialog.querySelector('[data-custom-apply]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Widget']);
      const icon = fixture.debugElement.query(By.css('thead th button[aria-label="Filter Name"]')).query(By.directive(IconComponent)).componentInstance as IconComponent;
      expect(icon.variant()).toBe('solid');

      (dialog.querySelector('[data-custom-clear]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(rowNames(fixture)).toEqual(['Widget', 'Gadget', 'Widget Pro']);
      expect(fixture.componentInstance.columnFilters()).toEqual({});
      expect(icon.variant()).not.toBe('solid');
    });
  });

  describe('DAT-039 filterOptions on TableColumnComponent', () => {
    it('uses explicit filterOptions for MultiSelect in menu mode and in row mode', () => {
      const fixture = TestBed.createComponent(FilterOptionsHostComponent);
      fixture.componentInstance.filterDisplay.set('menu');
      fixture.detectChanges();

      const funnelBtn = fixture.nativeElement.querySelector('thead th button[aria-label="Filter Category"]') as HTMLButtonElement;
      funnelBtn.click();
      fixture.detectChanges();

      const multiMenu = fixture.debugElement.query(By.directive(MultiSelectComponent)).componentInstance as MultiSelectComponent<string>;
      expect((multiMenu.options() as readonly { label: string; value: string }[]).map((o) => o.value)).toEqual(['A', 'B', 'Custom']);

      fixture.componentInstance.filterDisplay.set('row');
      fixture.detectChanges();

      const multiRow = fixture.debugElement.query(By.directive(MultiSelectComponent)).componentInstance as MultiSelectComponent<string>;
      expect((multiRow.options() as readonly { label: string; value: string }[]).map((o) => o.value)).toEqual(['A', 'B', 'Custom']);
    });

    it('renders DatePicker in filter row for date column', () => {
      const fixture = TestBed.createComponent(FilterRowHostComponent);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.directive(DatePickerComponent)).length).toBe(1);
    });

    // F-01: verify remediation
    it('keeps focus on moved header cell when reordering columns via Alt+ArrowRight with filterDisplay="row"', () => {
      @Component({
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table [value]="rows" [reorderableColumns]="true" filterDisplay="row">
            <med-table-column field="name" header="Name" [columnFilter]="true" />
            <med-table-column field="category" header="Category" [columnFilter]="true" />
          </med-data-table>
        `,
      })
      class ReorderFilterRowHostComponent {
        rows = [
          { name: 'Alpha', category: 'A' },
          { name: 'Beta', category: 'B' },
        ];
      }

      const fixture = TestBed.createComponent(ReorderFilterRowHostComponent);
      fixture.detectChanges();

      const headerRow = fixture.nativeElement.querySelector('thead tr[data-med-header-row]') as HTMLElement;
      const headers = Array.from(headerRow.querySelectorAll('th[scope="col"]')) as HTMLElement[];
      headers[0].focus();
      headers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true }));
      fixture.detectChanges();

      const updatedHeaders = Array.from(
        fixture.nativeElement.querySelectorAll('thead tr[data-med-header-row] th[scope="col"]'),
      ) as HTMLElement[];
      expect(updatedHeaders[1].textContent).toContain('Name');
      expect(document.activeElement).toBe(updatedHeaders[1]);
    });

    // S-01: verify security remediation
    it('handles sparse null/undefined rows in lazy + virtualScroll mode for filterMatchMode="in" without filterOptions', () => {
      @Component({
        imports: [DataTableComponent, TableColumnComponent],
        template: `
          <med-data-table
            [value]="rows"
            [lazy]="true"
            [virtualScroll]="true"
            [virtualScrollItemSize]="40"
            scrollHeight="120px"
            [totalRecords]="4"
            filterDisplay="row"
          >
            <med-table-column field="category" header="Category" [columnFilter]="true" filterMatchMode="in" />
          </med-data-table>
        `,
      })
      class SparseLazyInHostComponent {
        rows = [null, { category: 'A' }, undefined, { category: 'B' }] as unknown as { category: string }[];
      }

      const fixture = TestBed.createComponent(SparseLazyInHostComponent);
      expect(() => fixture.detectChanges()).not.toThrow();

      const multi = fixture.debugElement.query(By.directive(MultiSelectComponent)).componentInstance as MultiSelectComponent<string>;
      expect((multi.options() as readonly { label: string; value: string }[]).map((o) => o.value)).toEqual(['A', 'B']);
    });
  });
});
