import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableSortMeta, TableSortOrder } from './data-table.types';

interface Item {
  id: string;
  group: string;
  name: string;
  team: string;
  price: number;
  notes?: string;
}

const ITEMS: Item[] = [
  { id: '1', group: 'A', name: 'Alpha Beta', team: 'Core', price: 30, notes: 'n1' },
  { id: '2', group: 'A', name: 'Abaqus', team: 'Platform', price: 10, notes: 'n2' },
  { id: '3', group: 'A', name: 'Gamma', team: 'Core', price: 20, notes: 'n3' },
  { id: '4', group: 'B', name: 'Cabal', team: 'UI', price: 50, notes: 'n4' },
  { id: '5', group: 'B', name: 'Cab', team: 'UI', price: 40, notes: 'n5' },
  { id: '6', group: 'B', name: 'Fable', team: 'Core', price: 60, notes: 'n6' },
  { id: '7', group: 'B', name: 'Table', team: 'Platform', price: 25, notes: 'n7' },
  { id: '8', group: 'B', name: 'Zebra', team: 'Platform', price: 15, notes: 'n8' },
  { id: '9', group: 'B', name: 'Label', team: 'Core', price: 35, notes: 'n9' },
  { id: '10', group: 'B', name: 'Rabble', team: 'UI', price: 5, notes: 'n10' },
  { id: '11', group: 'B', name: 'Saber', team: 'Core', price: 45, notes: 'n11' },
  { id: '12', group: 'B', name: 'Dab', team: 'UI', price: 55, notes: 'n12' },
];

const STATE_KEY = 'dt-persisted-extended-state';

function headerCells(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('thead th'));
}

function headerTexts(fixture: ComponentFixture<unknown>): string[] {
  return headerCells(fixture).map((th) => {
    const clone = th.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('sup').forEach((sup) => sup.remove());
    return clone.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  });
}

function bodyDataRows(fixture: ComponentFixture<unknown>): HTMLTableRowElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLTableRowElement>('tbody tr')).filter(
    (tr) => !tr.querySelector('button[aria-expanded]') && !tr.textContent?.includes('No results found'),
  );
}

function searchInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
}

function rowsPerPageSelect(fixture: ComponentFixture<unknown>): HTMLSelectElement {
  return fixture.nativeElement.querySelector('med-paginator select') as HTMLSelectElement;
}

function paginatorText(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement.querySelector('med-paginator')?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function pressAlt(fixture: ComponentFixture<unknown>, header: HTMLElement, key: 'ArrowLeft' | 'ArrowRight'): void {
  header.focus();
  header.dispatchEvent(new KeyboardEvent('keydown', { key, altKey: true, bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

function dragResize(fixture: ComponentFixture<unknown>, header: HTMLElement, dx: number): void {
  const handle = header.querySelector('[data-col-resize-handle="true"]') as HTMLElement;
  handle.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 0 }));
  handle.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, cancelable: true, clientX: dx }));
  handle.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true, clientX: dx }));
  fixture.detectChanges();
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="items"
      dataKey="id"
      [stateKey]="stateKey"
      [resizableColumns]="true"
      [reorderableColumns]="true"
      sortMode="multiple"
      [filterable]="true"
      [paginator]="true"
      [rowsPerPageOptions]="[5, 10]"
      rowGroupMode="subheader"
      groupRowsBy="group"
      [expandableRowGroups]="true"
      [(multiSortMeta)]="multiSortMeta"
      [(globalFilterValue)]="globalFilterValue"
      [(expandedRowGroups)]="expandedRowGroups"
      [(first)]="first"
      (colReorder)="onColReorder($event)"
      (colResize)="onColResize($event)"
      (sort)="onSort($event)"
      (filter)="onFilter($event)"
      (pageChange)="onPageChange($event)"
      (rowGroupExpand)="onRowGroupExpand($event)"
      (rowGroupCollapse)="onRowGroupCollapse($event)"
    >
      <med-table-column field="name" header="Name" [sortable]="true" />
      <med-table-column field="team" header="Team" [(visible)]="teamVisible" [sortable]="true" />
      <med-table-column field="price" header="Price" [sortable]="true" />
    </med-data-table>
  `,
})
class ExtendedRoundTripHostComponent {
  items: Item[] = ITEMS;
  stateKey: string | null = STATE_KEY;
  teamVisible = signal(true);
  multiSortMeta = signal<readonly TableSortMeta[]>([]);
  globalFilterValue = signal('');
  expandedRowGroups = signal<readonly string[]>([]);
  first = signal(0);

  onColReorder = jest.fn();
  onColResize = jest.fn();
  onSort = jest.fn();
  onFilter = jest.fn();
  onPageChange = jest.fn();
  onRowGroupExpand = jest.fn();
  onRowGroupCollapse = jest.fn();
}

describe('DataTableComponent extended persisted state (DAT-056)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('DAT-056.S1: extended state round trip', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('DAT-056.S1: persists and restores column order, width, visibility, collapsed row groups, global filter, multiSortMeta and page size', () => {
      const first = TestBed.createComponent(ExtendedRoundTripHostComponent);
      first.detectChanges();
      first.detectChanges();

      // 1. Move price to first position (name, team, price -> price, name, team)
      pressAlt(first, headerCells(first)[2], 'ArrowLeft');
      pressAlt(first, headerCells(first)[1], 'ArrowLeft');
      expect(headerTexts(first)).toEqual(['Price', 'Name', 'Team']);

      // 2. Resize name to 180px (start width 140 -> drag +40)
      headerCells(first).forEach((th) => {
        th.getBoundingClientRect = () => ({ width: 140 }) as DOMRect;
      });
      const tableEl = first.nativeElement.querySelector('table') as HTMLElement;
      tableEl.getBoundingClientRect = () => ({ width: 420 }) as DOMRect;
      dragResize(first, headerCells(first)[1], 40);
      expect(headerCells(first)[1].style.width).toBe('180px');

      // 3. Hide team
      first.componentInstance.teamVisible.set(false);
      first.detectChanges();

      // 4. Collapse group A
      const groupAButton = first.nativeElement.querySelector('tbody button[aria-expanded]') as HTMLButtonElement;
      groupAButton.click();
      first.detectChanges();

      // 5. Commit global filter text 'ab'
      const input = searchInput(first);
      input.value = 'ab';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      jest.advanceTimersByTime(300);
      first.detectChanges();

      // 6. Sort by name asc then price desc
      const nameHeader = headerCells(first).find((th) => th.textContent?.includes('Name'))!;
      nameHeader.click();
      first.detectChanges();
      const priceHeader = headerCells(first).find((th) => th.textContent?.includes('Price'))!;
      priceHeader.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
      first.detectChanges();
      priceHeader.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
      first.detectChanges();

      // 7. Choose 5 rows per page
      const select = rowsPerPageSelect(first);
      select.value = '5';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      first.detectChanges();

      first.destroy();

      // Recreate table with fresh defaults
      const second = TestBed.createComponent(ExtendedRoundTripHostComponent);
      second.detectChanges();
      second.detectChanges();

      // All 8 Then clauses:
      // 1. Column order is price, name, team (team is hidden; when shown it appears 3rd)
      expect(headerTexts(second)).toEqual(['Price', 'Name']);

      // 2. Name header cell is 180px wide
      const restoredNameHeader = headerCells(second).find((th) => th.textContent?.includes('Name'))!;
      expect(restoredNameHeader.style.width).toBe('180px');

      // 3. Team is not rendered and its visible is false
      expect(second.componentInstance.teamVisible()).toBe(false);
      expect(headerTexts(second)).not.toContain('Team');

      // Showing team confirms full order is price, name, team
      second.componentInstance.teamVisible.set(true);
      second.detectChanges();
      expect(headerTexts(second)).toEqual(['Price', 'Name', 'Team']);

      // 4. expandedRowGroups holds A
      expect(second.componentInstance.expandedRowGroups()).toEqual(['A']);
      const restoredGroupAButton = second.nativeElement.querySelector('tbody button[aria-expanded]') as HTMLButtonElement;
      expect(restoredGroupAButton.getAttribute('aria-expanded')).toBe('false');

      // 5. Search box shows 'ab' immediately and only rows matching 'ab' are shown
      expect(searchInput(second).value).toBe('ab');
      const renderedText = bodyDataRows(second).map((tr) => tr.textContent ?? '');
      expect(renderedText.length).toBeGreaterThan(0);
      for (const text of renderedText) {
        expect(text.toLowerCase()).toContain('ab');
      }

      // 6. multiSortMeta is name asc then price desc
      expect(second.componentInstance.multiSortMeta()).toEqual([
        { field: 'name', order: 'asc' },
        { field: 'price', order: 'desc' },
      ]);

      // 7. Each page shows 5 rows (1 row in collapsed group A + 4 visible rows in group B)
      expect(bodyDataRows(second)).toHaveLength(4);
      expect(paginatorText(second)).toContain('Showing 1-5 of');
    });
  });

  describe('DAT-056.S2: state saved by an older version', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items"
          [stateKey]="stateKey"
          [paginator]="true"
          [filterable]="true"
          [(first)]="first"
          [(sortField)]="sortField"
          [(sortOrder)]="sortOrder"
          [(expandedRowGroups)]="expandedRowGroups"
          [(globalFilterValue)]="globalFilterValue"
          [(multiSortMeta)]="multiSortMeta"
        >
          <med-table-column field="name" header="Name" width="150px" [sortable]="true" />
          <med-table-column field="team" header="Team" [visible]="false" />
          <med-table-column field="price" header="Price" />
        </med-data-table>
      `,
    })
    class LegacyHostComponent {
      items = ITEMS;
      stateKey = STATE_KEY;
      first = signal(0);
      sortField = signal<string | null>(null);
      sortOrder = signal<TableSortOrder>(null);
      expandedRowGroups = signal<readonly string[]>([]);
      globalFilterValue = signal('');
      multiSortMeta = signal<readonly TableSortMeta[]>([]);
    }

    it('DAT-056.S2: restores first and sort while leaving column order, widths, visible, expandedRowGroups, globalFilterValue, multiSortMeta and page size at defaults', () => {
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({ first: 2, sortField: 'name', sortOrder: 'asc', expandedRowKeys: {} }),
      );

      const fixture = TestBed.createComponent(LegacyHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();

      expect(fixture.componentInstance.first()).toBe(2);
      expect(fixture.componentInstance.sortField()).toBe('name');
      expect(fixture.componentInstance.sortOrder()).toBe('asc');
      expect(headerTexts(fixture)).toEqual(['Name', 'Price']);
      expect(headerCells(fixture)[0].style.width).toBe('150px');
      expect(fixture.componentInstance.expandedRowGroups()).toEqual([]);
      expect(fixture.componentInstance.globalFilterValue()).toBe('');
      expect(fixture.componentInstance.multiSortMeta()).toEqual([]);
      expect(bodyDataRows(fixture)).toHaveLength(10);
    });
  });

  describe('DAT-056.S3, S4, S5, S9: validation and recovery on init', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items"
          [stateKey]="stateKey"
          [filterable]="true"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="rowsPerPageOptions"
          [(sortField)]="sortField"
          [(sortOrder)]="sortOrder"
          [(multiSortMeta)]="multiSortMeta"
        >
          <med-table-column field="name" header="Name" width="120px" [sortable]="true" />
          <med-table-column field="team" header="Team" [sortable]="true" />
          <med-table-column field="price" header="Price" [sortable]="true" />
        </med-data-table>
      `,
    })
    class ValidationHostComponent {
      items = ITEMS;
      stateKey = STATE_KEY;
      rowsPerPageOptions: readonly number[] | null = [5, 10];
      sortField = signal<string | null>('team');
      sortOrder = signal<TableSortOrder>('asc');
      multiSortMeta = signal<readonly TableSortMeta[]>([]);
    }

    it('DAT-056.S3: skips saved entries for removed columns across order, widths, visibility, multiSortMeta and sortField', () => {
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          columnOrder: ['legacy', 'price', 'name'],
          columnWidths: { legacy: 200, name: 170 },
          columnVisibility: { legacy: false, team: true },
          multiSortMeta: [
            { field: 'legacy', order: 'asc' },
            { field: 'name', order: 'desc' },
          ],
          sortField: 'legacy',
          sortOrder: 'desc',
        }),
      );

      const fixture = TestBed.createComponent(ValidationHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();

      expect(headerTexts(fixture)).toEqual(['Price', 'Name', 'Team']);
      expect(headerCells(fixture)[1].style.width).toBe('170px');
      expect(fixture.componentInstance.multiSortMeta()).toEqual([{ field: 'name', order: 'desc' }]);
      expect(fixture.componentInstance.sortField()).toBe('team');
      expect(fixture.componentInstance.sortOrder()).toBe('asc');
    });

    it('DAT-056.S4: malformed columnWidths and negative rows do not block globalFilter from restoring', () => {
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          columnWidths: 'bad',
          rows: -3,
          globalFilter: 'ab',
        }),
      );

      const fixture = TestBed.createComponent(ValidationHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();

      expect(headerCells(fixture)[0].style.width).toBe('120px');
      expect(paginatorText(fixture)).toContain('Showing 1-9 of 9');
      expect(searchInput(fixture).value).toBe('ab');
      const rows = bodyDataRows(fixture);
      expect(rows).toHaveLength(9);
      for (const tr of rows) {
        expect((tr.textContent ?? '').toLowerCase()).toContain('ab');
      }
    });

    it('DAT-056.S5: stored page size outside rowsPerPageOptions keeps declared rows', () => {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ rows: 50 }));

      const fixture = TestBed.createComponent(ValidationHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();

      expect(bodyDataRows(fixture)).toHaveLength(10);
      expect(paginatorText(fixture)).toContain('Showing 1-10 of 12');
    });

    it('DAT-056.S9: unreadable JSON text restores declared state and throws no error', () => {
      sessionStorage.setItem(STATE_KEY, '{not json');

      const fixture = TestBed.createComponent(ValidationHostComponent);
      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();

      expect(headerTexts(fixture)).toEqual(['Name', 'Team', 'Price']);
      expect(headerCells(fixture)[0].style.width).toBe('120px');
      expect(bodyDataRows(fixture)).toHaveLength(10);
    });
  });

  describe('DAT-056.S6 and S7: two-way column visibility and declared hidden override', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table [value]="items" [stateKey]="stateKey">
          <med-table-column field="name" header="Name" />
          <med-table-column field="team" header="Team" [(visible)]="teamVisible" />
          <med-table-column field="price" header="Price" />
        </med-data-table>
      `,
    })
    class TwoWayVisibilityHostComponent {
      items = ITEMS.slice(0, 3);
      stateKey = STATE_KEY;
      teamVisible = signal(true);
    }

    it('DAT-056.S6: restored visibility updates the bound [(visible)] signal and later application writes override it', () => {
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({ columnVisibility: { name: true, team: false, price: true } }),
      );

      const fixture = TestBed.createComponent(TwoWayVisibilityHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();

      expect(fixture.componentInstance.teamVisible()).toBe(false);
      expect(headerTexts(fixture)).toEqual(['Name', 'Price']);

      fixture.componentInstance.teamVisible.set(true);
      fixture.detectChanges();

      expect(headerTexts(fixture)).toEqual(['Name', 'Team', 'Price']);
      const saved = JSON.parse(sessionStorage.getItem(STATE_KEY)!);
      expect(saved.columnVisibility.team).toBe(true);
    });

    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table [value]="items" [stateKey]="stateKey">
          <med-table-column field="name" header="Name" />
          <med-table-column field="notes" header="Notes" [(visible)]="notesVisible" />
        </med-data-table>
      `,
    })
    class FirstHiddenHostComponent {
      items = ITEMS.slice(0, 3);
      stateKey = STATE_KEY;
      notesVisible = signal(false);
    }

    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table [value]="items" [stateKey]="stateKey">
          <med-table-column field="name" header="Name" />
          <med-table-column field="notes" header="Notes" visible="false" />
        </med-data-table>
      `,
    })
    class StaticHiddenHostComponent {
      items = ITEMS.slice(0, 3);
      stateKey = STATE_KEY;
    }

    it('DAT-056.S7: a column declared visible="false" stays shown when stored state recorded it visible', () => {
      const first = TestBed.createComponent(FirstHiddenHostComponent);
      first.detectChanges();
      first.detectChanges();
      expect(headerTexts(first)).toEqual(['Name']);

      first.componentInstance.notesVisible.set(true);
      first.detectChanges();
      expect(headerTexts(first)).toEqual(['Name', 'Notes']);
      first.destroy();

      const second = TestBed.createComponent(StaticHiddenHostComponent);
      second.detectChanges();
      second.detectChanges();

      expect(headerTexts(second)).toEqual(['Name', 'Notes']);
    });
  });

  describe('DAT-056.S8: restoring emits no user events', () => {
    it('DAT-056.S8: emits none of colReorder, colResize, sort, filter, pageChange, rowGroupExpand or rowGroupCollapse when restoring with all features enabled', () => {
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          columnOrder: ['price', 'name', 'team'],
          columnWidths: { name: 180 },
          columnVisibility: { name: true, team: false, price: true },
          collapsedRowGroups: ['A'],
          globalFilter: 'ab',
          multiSortMeta: [
            { field: 'name', order: 'asc' },
            { field: 'price', order: 'desc' },
          ],
          rows: 5,
        }),
      );

      const fixture = TestBed.createComponent(ExtendedRoundTripHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();

      expect(headerTexts(fixture)).toEqual(['Price', 'Name']);
      expect(searchInput(fixture).value).toBe('ab');
      expect(fixture.componentInstance.multiSortMeta()).toEqual([
        { field: 'name', order: 'asc' },
        { field: 'price', order: 'desc' },
      ]);
      expect(bodyDataRows(fixture)).toHaveLength(4);
      expect(paginatorText(fixture)).toContain('Showing 1-5 of');

      expect(fixture.componentInstance.onColReorder).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onColResize).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onSort).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onFilter).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onPageChange).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onRowGroupExpand).not.toHaveBeenCalled();
      expect(fixture.componentInstance.onRowGroupCollapse).not.toHaveBeenCalled();
    });
  });

  describe('S-01: bounded skeletonRows when stored rows is huge and rowsPerPageOptions is unset', () => {
    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items"
          [stateKey]="stateKey"
          [paginator]="true"
          loadingMode="skeleton"
          [loading]="true"
          [rows]="5"
        >
          <med-table-column field="name" header="Name" />
        </med-data-table>
      `,
    })
    class SkeletonHostComponent {
      items = ITEMS;
      stateKey = STATE_KEY;
    }

    it('S-01: ignores Number.MAX_SAFE_INTEGER rows without throwing RangeError', () => {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ rows: Number.MAX_SAFE_INTEGER }));

      const fixture = TestBed.createComponent(SkeletonHostComponent);
      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();

      const skeletonRows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(skeletonRows.length).toBe(5);
    });
  });
});
