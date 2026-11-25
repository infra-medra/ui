import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableLoadingMode, TableSelectionMode } from './data-table.types';

/** Values accepted by the table's `rowGroupMode` input. */
type TableRowGroupMode = 'subheader' | 'rowspan' | null;

interface WideColumnDef {
  readonly field: string;
  readonly header: string;
  readonly frozen?: boolean;
  readonly alignFrozen?: 'left' | 'right';
  readonly width?: string | null;
  readonly filter?: boolean;
  readonly footer?: string | null;
}

type WideRow = Record<string, string | number>;

function makeWideRows(rowCount: number, colCount: number): WideRow[] {
  return Array.from({ length: rowCount }, (_, r) => {
    const row: WideRow = {
      id: r,
      group: r < Math.ceil(rowCount / 2) ? 'Alpha' : 'Beta',
      frozen: `F-${r}`,
      rightFrozen: `R-${r}`,
    };
    for (let c = 0; c < colCount; c++) {
      row[`col${c}`] = `R${r}C${c}`;
    }
    return row;
  });
}

function makeScrollableColumns(count: number, options?: { width?: string | null; filter?: boolean; footer?: boolean }): WideColumnDef[] {
  return Array.from({ length: count }, (_, i) => ({
    field: `col${i}`,
    header: `Col ${i}`,
    width: options?.width ?? null,
    filter: options?.filter ?? false,
    footer: options?.footer ? `Foot ${i}` : null,
  }));
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      [frozenValue]="frozenRows()"
      [virtualScroll]="virtualScroll()"
      [virtualScrollItemSize]="40"
      [scrollHeight]="scrollHeight()"
      [virtualScrollColumns]="virtualScrollColumns()"
      [virtualScrollColumnWidth]="virtualScrollColumnWidth()"
      [filterDisplay]="filterDisplay()"
      [loading]="loading()"
      [loadingMode]="loadingMode()"
      [selectionMode]="selectionMode()"
      [reorderable]="reorderable()"
      [rowGroupMode]="rowGroupMode()"
      [groupRowsBy]="groupRowsBy()"
      [responsiveLayout]="responsiveLayout()"
      [breakpoint]="breakpoint()"
      dataKey="id"
      [(expandedRowKeys)]="expandedRowKeys"
    >
      @for (col of cols(); track col.field) {
        <med-table-column
          [field]="col.field"
          [header]="col.header"
          [frozen]="!!col.frozen"
          [alignFrozen]="col.alignFrozen ?? 'left'"
          [width]="col.width ?? null"
          [columnFilter]="!!col.filter"
          [footer]="col.footer ?? null"
        />
      }
      @if (withExpansion()) {
        <ng-template #rowexpansion let-row>
          <div class="expanded-detail">Detail: {{ row['id'] }}</div>
        </ng-template>
      }
    </med-data-table>
  `,
})
class VirtualColumnsHostComponent {
  rows = signal<WideRow[]>(makeWideRows(5, 50));
  frozenRows = signal<WideRow[]>([]);
  cols = signal<WideColumnDef[]>([
    { field: 'frozen', header: 'Frozen', frozen: true, alignFrozen: 'left', width: '100px' },
    ...makeScrollableColumns(50),
  ]);
  virtualScroll = signal(false);
  scrollHeight = signal<string | null>(null);
  virtualScrollColumns = signal(true);
  virtualScrollColumnWidth = signal(100);
  filterDisplay = signal<'menu' | 'row'>('menu');
  loading = signal(false);
  loadingMode = signal<TableLoadingMode>('spinner');
  selectionMode = signal<TableSelectionMode>(null);
  reorderable = signal(false);
  rowGroupMode = signal<TableRowGroupMode>(null);
  groupRowsBy = signal<string | null>(null);
  responsiveLayout = signal<'scroll' | 'stack'>('scroll');
  breakpoint = signal('960px');
  expandedRowKeys = signal<Record<string, boolean>>({});
  withExpansion = signal(false);
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="rows()" [virtualScrollColumns]="enabled()">
      @for (col of cols(); track col.field) {
        <med-table-column [field]="col.field" [header]="col.header" />
      }
    </med-data-table>
  `,
})
class VirtualColumnsDefaultsHostComponent {
  rows = signal<WideRow[]>(makeWideRows(3, 20));
  cols = signal<WideColumnDef[]>(makeScrollableColumns(20));
  enabled = signal(false);
}

describe('DataTableComponent virtualScrollColumns (DAT-063)', () => {
  const originalResizeObserver = globalThis.ResizeObserver;
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    window.matchMedia = originalMatchMedia;
    document.body.innerHTML = '';
  });

  function installViewportResizeObserver(viewportWidth: number, viewportHeight = 400): void {
    class MockResizeObserver {
      private readonly cb: ResizeObserverCallback;
      constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
      }
      observe(target: Element): void {
        if (target.hasAttribute('data-med-scroll-viewport')) {
          Object.defineProperty(target, 'clientWidth', { value: viewportWidth, configurable: true });
          Object.defineProperty(target, 'clientHeight', { value: viewportHeight, configurable: true });
          this.cb(
            [
              {
                target,
                contentRect: { width: viewportWidth, height: viewportHeight } as DOMRectReadOnly,
              } as ResizeObserverEntry,
            ],
            this as unknown as ResizeObserver,
          );
        }
      }
      unobserve(): void {}
      disconnect(): void {}
    }
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  }

  function create<T>(component: new () => T, configure?: (host: T) => void): ComponentFixture<T> {
    const fixture = TestBed.createComponent(component);
    configure?.(fixture.componentInstance);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    return fixture;
  }

  const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
  const tableEl = (fixture: ComponentFixture<unknown>) => root(fixture).querySelector<HTMLTableElement>('table')!;
  const viewport = (fixture: ComponentFixture<unknown>) => root(fixture).querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
  const headerCells = (fixture: ComponentFixture<unknown>) =>
    Array.from(root(fixture).querySelectorAll<HTMLTableCellElement>('tr[data-med-header-row] > th'));
  const firstBodyRowCells = (fixture: ComponentFixture<unknown>) =>
    Array.from(root(fixture).querySelectorAll<HTMLTableCellElement>('tbody tr:first-child > td'));

  function scrollHorizontal(fixture: ComponentFixture<unknown>, scrollLeft: number): void {
    const vp = viewport(fixture);
    vp.scrollLeft = scrollLeft;
    vp.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  function rowColspanSum(tr: Element): number {
    return Array.from(tr.querySelectorAll<HTMLTableCellElement>(':scope > th, :scope > td')).reduce(
      (sum, cell) => sum + Math.max(1, Number(cell.getAttribute('colspan') ?? '1')),
      0,
    );
  }

  it('DAT-063.S1: renders only horizontal window and frozen columns with 5,100px width, shifts window at scrollLeft=2,500, and exposes aria-colcount/aria-colindex', () => {
    installViewportResizeObserver(400);
    const fixture = create(VirtualColumnsHostComponent, (host) => {
      host.rows.set(makeWideRows(5, 50));
      host.cols.set([
        { field: 'frozen', header: 'Frozen', frozen: true, alignFrozen: 'left', width: '100px' },
        ...makeScrollableColumns(50),
      ]);
      host.virtualScrollColumns.set(true);
      host.virtualScrollColumnWidth.set(100);
    });

    const table = tableEl(fixture);
    expect(table.style.width).toBe('5100px');
    expect(table.getAttribute('aria-colcount')).toBe('51');

    // Initial render: fewer than 20 columns per row, left-frozen column rendered, right spacer present, no left spacer yet.
    expect(headerCells(fixture).length).toBeLessThan(20);
    expect(firstBodyRowCells(fixture).length).toBeLessThan(20);
    expect(root(fixture).querySelector('tbody td[data-med-field="frozen"]')).not.toBeNull();
    expect(root(fixture).querySelector('tbody td[data-med-field="col0"]')).not.toBeNull();
    expect(root(fixture).querySelector('tbody td[data-med-field="col49"]')).toBeNull();
    expect(root(fixture).querySelector('tr[data-med-header-row] [data-med-col-spacer-left]')).toBeNull();
    expect(root(fixture).querySelector('tr[data-med-header-row] [data-med-col-spacer-right]')).not.toBeNull();

    // Scroll horizontally to 2,500px.
    scrollHorizontal(fixture, 2500);

    expect(headerCells(fixture).length).toBeLessThan(20);
    expect(firstBodyRowCells(fixture).length).toBeLessThan(20);
    expect(table.style.width).toBe('5100px');
    expect(table.getAttribute('aria-colcount')).toBe('51');

    // Left-frozen column remains rendered and early scrollable columns are unmounted.
    const frozenCell = root(fixture).querySelector<HTMLElement>('tbody td[data-med-field="frozen"]');
    expect(frozenCell).not.toBeNull();
    expect(frozenCell?.getAttribute('aria-colindex')).toBe('1');
    expect(root(fixture).querySelector('tbody td[data-med-field="col0"]')).toBeNull();
    expect(root(fixture).querySelector('tbody td[data-med-field="col1"]')).toBeNull();
    expect(root(fixture).querySelector('tbody td[data-med-field="col5"]')).toBeNull();

    // Columns around index 25 render with true 1-based aria-colindex and both spacers.
    const col25Cell = root(fixture).querySelector<HTMLElement>('tbody td[data-med-field="col25"]');
    expect(col25Cell).not.toBeNull();
    expect(col25Cell?.getAttribute('aria-colindex')).toBe('27');

    const headerLeftSpacer = root(fixture).querySelector<HTMLElement>('tr[data-med-header-row] th[data-med-col-spacer-left]');
    const headerRightSpacer = root(fixture).querySelector<HTMLElement>('tr[data-med-header-row] th[data-med-col-spacer-right]');
    const bodyLeftSpacer = root(fixture).querySelector<HTMLElement>('tbody td[data-med-col-spacer-left]');
    expect(headerLeftSpacer).not.toBeNull();
    expect(headerRightSpacer).not.toBeNull();
    expect(bodyLeftSpacer).not.toBeNull();
    expect(parseFloat(headerLeftSpacer!.style.width)).toBeGreaterThan(0);
    expect(parseFloat(headerRightSpacer!.style.width)).toBeGreaterThan(0);

    const renderedNonSpacerWidth = headerCells(fixture)
      .filter((th) => !th.hasAttribute('data-med-col-spacer-left') && !th.hasAttribute('data-med-col-spacer-right'))
      .reduce((sum, th) => sum + parseFloat(th.style.width || '0'), 0);
    expect(
      parseFloat(headerLeftSpacer!.style.width) + renderedNonSpacerWidth + parseFloat(headerRightSpacer!.style.width),
    ).toBe(5100);
  });

  it('REQ DAT-063: leaves virtualScrollColumns off by default, uses 120px default column width, and clamps widths below 1px', () => {
    installViewportResizeObserver(400);
    const defaultsFixture = create(VirtualColumnsDefaultsHostComponent);
    expect(headerCells(defaultsFixture).length).toBe(20);
    expect(tableEl(defaultsFixture).getAttribute('aria-colcount')).toBeNull();
    expect(root(defaultsFixture).querySelector('[data-med-col-spacer-left], [data-med-col-spacer-right]')).toBeNull();

    defaultsFixture.componentInstance.enabled.set(true);
    defaultsFixture.detectChanges();
    expect(tableEl(defaultsFixture).style.width).toBe('2400px');
    expect(tableEl(defaultsFixture).getAttribute('aria-colcount')).toBe('20');
    expect(headerCells(defaultsFixture).length).toBeLessThan(20);

    const clampedFixture = create(VirtualColumnsHostComponent, (host) => {
      host.cols.set(makeScrollableColumns(10));
      host.virtualScrollColumns.set(true);
      host.virtualScrollColumnWidth.set(0);
    });
    expect(tableEl(clampedFixture).style.width).toBe('10px');

    clampedFixture.componentInstance.virtualScrollColumnWidth.set(-15);
    clampedFixture.detectChanges();
    expect(tableEl(clampedFixture).style.width).toBe('10px');
  });

  it('REQ DAT-063: inserts horizontal spacers across header, filter, frozen, body, skeleton, and footer rows and aligns colspan rows', () => {
    installViewportResizeObserver(400);
    const fixture = create(VirtualColumnsHostComponent, (host) => {
      host.rows.set(makeWideRows(6, 30));
      host.frozenRows.set(makeWideRows(1, 30));
      host.cols.set([
        { field: 'frozen', header: 'Frozen', frozen: true, alignFrozen: 'left', width: '100px', filter: true, footer: 'F-Foot' },
        ...makeScrollableColumns(30, { filter: true, footer: true }),
      ]);
      host.filterDisplay.set('row');
      host.virtualScrollColumns.set(true);
      host.virtualScrollColumnWidth.set(100);
    });

    scrollHorizontal(fixture, 1200);
    const expectedDomCols = headerCells(fixture).length;

    const headerRow = root(fixture).querySelector('tr[data-med-header-row]')!;
    const filterRow = root(fixture).querySelector('tr[data-med-filter-row]')!;
    const frozenRow = root(fixture).querySelector('tbody tr[data-med-frozen-row], thead + tbody tr')!;
    const bodyRow = root(fixture).querySelector('tbody:last-of-type tr')!;
    const footerRow = root(fixture).querySelector('tfoot tr[data-med-column-footer]')!;

    for (const row of [headerRow, filterRow, frozenRow, bodyRow, footerRow]) {
      expect(row.querySelector('[data-med-col-spacer-left]')).not.toBeNull();
      expect(row.querySelector('[data-med-col-spacer-right]')).not.toBeNull();
      expect(rowColspanSum(row)).toBe(expectedDomCols);
    }

    // Skeleton rows keep spacers and exact column count.
    fixture.componentInstance.loading.set(true);
    fixture.componentInstance.loadingMode.set('skeleton');
    fixture.detectChanges();
    const skeletonRow = root(fixture).querySelector('tbody tr')!;
    expect(skeletonRow.querySelector('[data-med-col-spacer-left]')).not.toBeNull();
    expect(skeletonRow.querySelector('[data-med-col-spacer-right]')).not.toBeNull();
    expect(rowColspanSum(skeletonRow)).toBe(expectedDomCols);

    // Empty row colspan matches totalColumnCount.
    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.rows.set([]);
    fixture.detectChanges();
    const emptyRow = root(fixture).querySelector('tbody tr')!;
    expect(rowColspanSum(emptyRow)).toBe(expectedDomCols);

    // Subheader + expansion + vertical virtualScroll spacer colspan align with rendered DOM column count.
    fixture.componentInstance.rows.set(makeWideRows(30, 30));
    fixture.componentInstance.frozenRows.set([]);
    fixture.componentInstance.virtualScroll.set(true);
    fixture.componentInstance.scrollHeight.set('160px');
    fixture.componentInstance.rowGroupMode.set('subheader');
    fixture.componentInstance.groupRowsBy.set('group');
    fixture.componentInstance.withExpansion.set(true);
    fixture.componentInstance.expandedRowKeys.set({ '0': true });
    fixture.detectChanges();

    const allBodyRows = Array.from(root(fixture).querySelectorAll('tbody tr'));
    expect(allBodyRows.length).toBeGreaterThan(2);
    for (const row of allBodyRows) {
      expect(rowColspanSum(row)).toBe(expectedDomCols);
    }
  });

  it('REQ DAT-063: preserves left/right frozen columns, declared px widths, and utility columns, and disables horizontal virtualization when stacked', () => {
    installViewportResizeObserver(400);
    const listeners = new Set<(event: { matches: boolean; media: string }) => void>();
    const mediaQueryList = {
      matches: false,
      media: '(width < 960px)',
      addEventListener: (_type: string, listener: (event: { matches: boolean; media: string }) => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: (event: { matches: boolean; media: string }) => void) => listeners.delete(listener),
      addListener: (listener: (event: { matches: boolean; media: string }) => void) => listeners.add(listener),
      removeListener: (listener: (event: { matches: boolean; media: string }) => void) => listeners.delete(listener),
      dispatchEvent: () => true,
    };
    window.matchMedia = jest.fn(() => mediaQueryList) as unknown as typeof window.matchMedia;

    const scrollable = makeScrollableColumns(30);
    scrollable[0] = { ...scrollable[0], width: '150px' };

    const fixture = create(VirtualColumnsHostComponent, (host) => {
      host.rows.set(makeWideRows(4, 30));
      host.cols.set([
        { field: 'frozen', header: 'Frozen', frozen: true, alignFrozen: 'left', width: '80px' },
        ...scrollable,
        { field: 'rightFrozen', header: 'Right', frozen: true, alignFrozen: 'right', width: '90px' },
      ]);
      host.selectionMode.set('multiple');
      host.reorderable.set(true);
      host.virtualScrollColumns.set(true);
      host.virtualScrollColumnWidth.set(100);
    });

    // 40 (selection) + 32 (reorder) + 80 (left frozen) + 90 (right frozen) + 150 (col0) + 29*100 = 3292px
    expect(tableEl(fixture).style.width).toBe('3292px');
    // 2 utility + 32 data columns = 34
    expect(tableEl(fixture).getAttribute('aria-colcount')).toBe('34');

    scrollHorizontal(fixture, 1500);
    expect(root(fixture).querySelector('tbody td[data-med-field="frozen"]')).not.toBeNull();
    expect(root(fixture).querySelector('tbody td[data-med-field="rightFrozen"]')).not.toBeNull();

    // Stacked layout disables horizontal column virtualization.
    mediaQueryList.matches = true;
    for (const listener of listeners) {
      listener({ matches: true, media: mediaQueryList.media });
    }
    fixture.componentInstance.responsiveLayout.set('stack');
    fixture.detectChanges();

    expect(root(fixture).querySelector('[data-med-col-spacer-left], [data-med-col-spacer-right]')).toBeNull();
    expect(root(fixture).querySelectorAll('tbody tr:first-child td[data-med-field]').length).toBe(32);
  });

  // F-02: non-px / sub-1px width consistency
  it('REQ DAT-063: aligns non-px and sub-1px declared column widths across th styles, frozen offsets, and total table width', () => {
    const scrollable = makeScrollableColumns(5);
    scrollable[0] = { ...scrollable[0], width: '20%' };

    const fixture = create(VirtualColumnsHostComponent, (host) => {
      host.rows.set(makeWideRows(2, 5));
      host.cols.set([
        { field: 'f0', header: 'F0', frozen: true, alignFrozen: 'left', width: '0px' },
        { field: 'f1', header: 'F1', frozen: true, alignFrozen: 'left', width: '100px' },
        ...scrollable,
      ]);
      host.virtualScrollColumns.set(true);
      host.virtualScrollColumnWidth.set(110);
    });

    const headers = Array.from(root(fixture).querySelectorAll('thead tr[data-med-header-row] th[scope="col"]')) as HTMLElement[];
    const f0Th = headers[0];
    const f1Th = headers[1];
    const col0Th = headers[2];
    expect(f0Th.style.width).toBe('1px');
    expect(f1Th.style.left).toBe('1px');
    expect(col0Th.style.width).toBe('110px');
    // 1 (f0) + 100 (f1) + 5 * 110 = 651px
    expect(tableEl(fixture).style.width).toBe('651px');
  });
});
