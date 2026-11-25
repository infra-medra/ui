import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';

interface VariableRow {
  readonly id: number;
  readonly name: string;
}

const makeRows = (count: number): VariableRow[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Row ${i}`,
  }));

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows()"
      [virtualScroll]="true"
      [virtualScrollItemSize]="itemSize()"
      [virtualScrollRowHeight]="rowHeight()"
      [scrollHeight]="scrollHeight()"
      [lazy]="lazy()"
      [totalRecords]="totalRecords()"
      [keyboardNavigation]="keyboardNavigation()"
    >
      <med-table-column field="name" header="Name">
        <ng-template let-row>{{ row.name }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class VariableHeightHostComponent {
  rows = signal<(VariableRow | null)[]>(makeRows(50));
  itemSize = signal(40);
  rowHeight = signal<((row: VariableRow, index: number) => number) | 'auto' | null>(null);
  scrollHeight = signal<string | null>('200px');
  lazy = signal(false);
  totalRecords = signal<number | null>(null);
  keyboardNavigation = signal(false);
}

describe('DataTableComponent virtualScrollRowHeight (DAT-061)', () => {
  const originalResizeObserver = globalThis.ResizeObserver;

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    document.body.innerHTML = '';
  });

  function create(configure?: (host: VariableHeightHostComponent) => void): ComponentFixture<VariableHeightHostComponent> {
    const fixture = TestBed.createComponent(VariableHeightHostComponent);
    configure?.(fixture.componentInstance);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    return fixture;
  }

  const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;
  const viewport = (fixture: ComponentFixture<unknown>) => root(fixture).querySelector<HTMLElement>('[data-med-scroll-viewport]')!;
  const bodyRows = (fixture: ComponentFixture<unknown>) => Array.from(root(fixture).querySelectorAll<HTMLElement>('tbody tr[aria-rowindex]'));
  const spacerHeights = (fixture: ComponentFixture<unknown>) =>
    Array.from(root(fixture).querySelectorAll<HTMLElement>('tbody tr[aria-hidden="true"] td')).map((td) => parseFloat(td.style.height) || 0);
  const totalScrollableHeight = (fixture: ComponentFixture<unknown>, fallbackRowHeight = 40) => {
    const spacers = spacerHeights(fixture).reduce((sum, h) => sum + h, 0);
    const rows = bodyRows(fixture).reduce((sum, tr) => sum + (parseFloat(tr.style.height) || fallbackRowHeight), 0);
    return spacers + rows;
  };
  const rowAt = (fixture: ComponentFixture<unknown>, index: number) =>
    root(fixture).querySelector<HTMLElement>(`tbody tr[aria-rowindex="${index + 2}"]`);

  function scrollTo(fixture: ComponentFixture<unknown>, top: number): void {
    const vp = viewport(fixture);
    vp.scrollTop = top;
    vp.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  it('DAT-061.S1: callback-driven variable row heights size rows, spacers, window at 1,200px, and End key scroll/focus', () => {
    const fixture = create((host) => {
      host.rows.set(makeRows(50));
      host.itemSize.set(40);
      host.scrollHeight.set('200px');
      host.keyboardNavigation.set(true);
      host.rowHeight.set((_row, index) => (index % 2 === 0 ? 80 : 40));
    });

    expect(totalScrollableHeight(fixture)).toBe(3000);
    expect(bodyRows(fixture).map((tr) => Number(tr.getAttribute('aria-rowindex')) - 2)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);

    scrollTo(fixture, 1200);

    expect(totalScrollableHeight(fixture)).toBe(3000);
    expect(spacerHeights(fixture)).toEqual([920, 1320]);
    const rendered = bodyRows(fixture);
    expect(rendered.map((tr) => Number(tr.getAttribute('aria-rowindex')) - 2)).toEqual([15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]);
    for (const tr of rendered) {
      const index = Number(tr.getAttribute('aria-rowindex')) - 2;
      expect(tr.style.height).toBe(`${index % 2 === 0 ? 80 : 40}px`);
    }

    const row20 = rowAt(fixture, 20)!;
    row20.focus();
    row20.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    fixture.detectChanges();

    expect(viewport(fixture).scrollTop).toBe(2800);
    const lastRow = rowAt(fixture, 49)!;
    expect(lastRow).not.toBeNull();
    expect(document.activeElement).toBe(lastRow);

    lastRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    fixture.detectChanges();

    expect(viewport(fixture).scrollTop).toBe(0);
    expect(document.activeElement).toBe(rowAt(fixture, 0));
  });

  it('REQ DAT-061: clamps callback heights to >= 1px and falls back to virtualScrollItemSize for non-finite values and lazy placeholders', () => {
    const heights = [0, -12, Number.NaN, Number.POSITIVE_INFINITY, 90];
    const callback = jest.fn((row: VariableRow, index: number) => {
      if (row === null || row === undefined) {
        throw new Error('Callback must not be called for null placeholder');
      }
      return heights[index] ?? 40;
    });

    const sparse: (VariableRow | null)[] = Array.from({ length: 10 }, (_, i) => (i < 5 ? { id: i, name: `Row ${i}` } : null));
    const fixture = create((host) => {
      host.lazy.set(true);
      host.totalRecords.set(10);
      host.rows.set(sparse);
      host.itemSize.set(40);
      host.rowHeight.set(callback);
    });

    // Loaded rows: [1, 1, 40, 40, 90] = 172; 5 placeholders at 40px each = 200 -> total 372
    expect(totalScrollableHeight(fixture)).toBe(372);
    expect(rowAt(fixture, 0)!.style.height).toBe('1px');
    expect(rowAt(fixture, 1)!.style.height).toBe('1px');
    expect(rowAt(fixture, 2)!.style.height).toBe('40px');
    expect(rowAt(fixture, 3)!.style.height).toBe('40px');
    expect(rowAt(fixture, 4)!.style.height).toBe('90px');
    expect(rowAt(fixture, 5)!.hasAttribute('data-med-placeholder')).toBe(true);
    expect(rowAt(fixture, 5)!.style.height).toBe('40px');
  });

  it('REQ DAT-061: virtualScrollRowHeight=null keeps fixed virtualScrollItemSize heights and cell truncate', () => {
    const fixture = create((host) => {
      host.rows.set(makeRows(20));
      host.itemSize.set(40);
      host.rowHeight.set(null);
    });

    expect(totalScrollableHeight(fixture)).toBe(800);
    const firstRow = rowAt(fixture, 0)!;
    expect(firstRow.style.height).toBe('40px');
    expect(firstRow.querySelector('td')!.classList.contains('truncate')).toBe(true);
  });

  it('REQ DAT-061: virtualScrollRowHeight="auto" omits fixed height and cell truncate, and updates offsets from ResizeObserver', () => {
    const observed: { target: Element; cb: ResizeObserverCallback }[] = [];
    class MockResizeObserver {
      private readonly cb: ResizeObserverCallback;
      constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
      }
      observe(target: Element): void {
        observed.push({ target, cb: this.cb });
      }
      unobserve(target: Element): void {
        const idx = observed.findIndex((o) => o.target === target);
        if (idx !== -1) {
          observed.splice(idx, 1);
        }
      }
      disconnect(): void {
        observed.length = 0;
      }
    }
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    const fixture = create((host) => {
      host.rows.set(makeRows(30));
      host.itemSize.set(40);
      host.scrollHeight.set('200px');
      host.rowHeight.set('auto');
    });
    fixture.detectChanges();

    const initialRows = bodyRows(fixture);
    expect(initialRows.length).toBe(10);
    for (const tr of initialRows) {
      expect(tr.style.height).toBe('');
      expect(tr.querySelector('td')!.classList.contains('truncate')).toBe(false);
    }
    expect(spacerHeights(fixture)).toEqual([20 * 40]);

    const entries = initialRows
      .map((tr) => {
        const entry = observed.find((o) => o.target === tr);
        return entry ? ({ target: tr, contentRect: { height: 70 } as DOMRectReadOnly } as unknown as ResizeObserverEntry) : null;
      })
      .filter((e): e is ResizeObserverEntry => e !== null);
    expect(entries.length).toBe(10);

    const observerCb = observed.find((o) => o.target === initialRows[0])!.cb;
    observerCb(entries, {} as ResizeObserver);
    fixture.detectChanges();

    // 10 measured rows at 70px (700) + 20 unmeasured at 40px (800).
    // Rendered window at scrollTop=0 with 200px viewport and 70px rows: visible [0..3), buffered [0..8) -> bottom spacer = 2*70 + 20*40 = 940
    expect(spacerHeights(fixture)).toEqual([940]);
    expect(observed.length).toBeGreaterThan(0);

    // Scrolling to 490px (row 7) puts rows [0..2) into top spacer (140px) and [15..30) into bottom spacer (600px)
    scrollTo(fixture, 490);
    expect(spacerHeights(fixture)).toEqual([140, 600]);
  });

  it('REQ DAT-061: virtualScrollRowHeight="auto" compensates scrollTop when rows above viewport change height and resets on data change', () => {
    const observed = new Map<Element, ResizeObserverCallback>();
    class MockResizeObserver {
      private readonly cb: ResizeObserverCallback;
      constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
      }
      observe(target: Element): void {
        observed.set(target, this.cb);
      }
      unobserve(target: Element): void {
        observed.delete(target);
      }
      disconnect(): void {
        observed.clear();
      }
    }
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    const fixture = create((host) => {
      host.rows.set(makeRows(50));
      host.itemSize.set(40);
      host.scrollHeight.set('200px');
      host.rowHeight.set('auto');
    });
    fixture.detectChanges();

    // Scroll to row 20 (offset 800px); buffered range is [15, 30)
    scrollTo(fixture, 800);
    fixture.detectChanges();

    const row16 = rowAt(fixture, 16)!;
    const row22 = rowAt(fixture, 22)!;
    expect(row16).not.toBeNull();
    expect(row22).not.toBeNull();
    const cb = observed.get(row16)!;
    expect(cb).toBeDefined();

    // Row 16 (above top visible row 20) grows +50px; row 22 (inside viewport) grows +20px.
    cb(
      [
        { target: row16, contentRect: { height: 90 } as DOMRectReadOnly } as unknown as ResizeObserverEntry,
        { target: row22, contentRect: { height: 60 } as DOMRectReadOnly } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    );
    fixture.detectChanges();

    expect(viewport(fixture).scrollTop).toBe(850);

    // Replacing rows resets measured heights back to initial estimate (40px per row)
    scrollTo(fixture, 0);
    fixture.componentInstance.rows.set(makeRows(25));
    fixture.detectChanges();

    expect(spacerHeights(fixture)).toEqual([(25 - bodyRows(fixture).length) * 40]);
  });
});
