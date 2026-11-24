import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';

interface Item {
  readonly id: number;
  readonly name: string;
  readonly price: number;
}

const ITEMS: readonly Item[] = [
  { id: 1, name: 'Gamma', price: 30 },
  { id: 2, name: 'Alpha', price: 10 },
  { id: 3, name: 'Beta', price: 20 },
];

function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
}

describe('DataTableComponent responsive stack enhancements (DAT-050.S7, DAT-060.S1)', () => {
  const originalMatchMedia = window.matchMedia;
  const originalResizeObserver = globalThis.ResizeObserver;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    globalThis.ResizeObserver = originalResizeObserver;
  });

  // DAT-050.S7
  it('DAT-050.S7: breakpointMode="container" stacks and unstacks based on observed host width instead of viewport', () => {
    mockMatchMedia(false); // wide viewport

    const observers: { target: Element; cb: ResizeObserverCallback }[] = [];
    class MockResizeObserver {
      private readonly cb: ResizeObserverCallback;
      constructor(cb: ResizeObserverCallback) {
        this.cb = cb;
      }
      observe(target: Element): void {
        observers.push({ target, cb: this.cb });
      }
      unobserve(): void {}
      disconnect(): void {}
    }
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items"
          responsiveLayout="stack"
          breakpoint="500px"
          breakpointMode="container"
        >
          <med-table-column field="name" header="Name" />
          <med-table-column field="price" header="Price" />
        </med-data-table>
      `,
    })
    class ContainerBreakpointHostComponent {
      items = ITEMS;
    }

    const fixture = TestBed.createComponent(ContainerBreakpointHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const hostEl = fixture.nativeElement.querySelector('med-data-table') as Element;
    const triggerWidth = (width: number) => {
      const hostObserver = observers.find((o) => o.target === hostEl);
      expect(hostObserver).toBeDefined();
      hostObserver!.cb(
        [{ target: hostEl, contentRect: { width } as DOMRectReadOnly } as ResizeObserverEntry],
        {} as ResizeObserver,
      );
      fixture.detectChanges();
    };

    triggerWidth(600);
    expect(fixture.nativeElement.querySelector('tbody tr')?.classList.contains('block')).toBe(false);

    triggerWidth(420);
    expect(fixture.nativeElement.querySelector('tbody tr')?.classList.contains('block')).toBe(true);

    triggerWidth(500);
    expect(fixture.nativeElement.querySelector('tbody tr')?.classList.contains('block')).toBe(false);
  });

  // DAT-060.S1
  it('DAT-060.S1: renders visible stacked sort control when stacked and sorts rows ascending, descending, and clears', () => {
    mockMatchMedia(true); // narrow viewport -> stacked

    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items"
          responsiveLayout="stack"
          breakpoint="960px"
          (sort)="onSort($event)"
        >
          <med-table-column field="name" header="Name" sortable />
          <med-table-column field="price" header="Price" sortable />
        </med-data-table>
      `,
    })
    class StackedSortHostComponent {
      items = ITEMS;
      sortEvents: { field: string | null; order: string | null }[] = [];
      onSort(e: { field: string | null; order: string | null }): void {
        this.sortEvents.push({ field: e.field, order: e.order });
      }
    }

    const fixture = TestBed.createComponent(StackedSortHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const sortBar = fixture.nativeElement.querySelector('[data-med-stack-sort]') as HTMLElement | null;
    expect(sortBar).not.toBeNull();

    const select = sortBar!.querySelector('select[aria-label="Sort by"]') as HTMLSelectElement;
    expect(select).not.toBeNull();

    select.value = 'price';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const firstCellTexts = (f: ComponentFixture<unknown>) =>
      Array.from<HTMLElement>(f.nativeElement.querySelectorAll('tbody tr')).map((tr) =>
        tr.querySelector('td')?.textContent?.replace('Name', '').trim(),
      );

    expect(firstCellTexts(fixture)).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(fixture.componentInstance.sortEvents.at(-1)).toEqual({ field: 'price', order: 'asc' });
    const priceHeader = fixture.nativeElement.querySelectorAll('thead th[scope="col"]')[1] as HTMLElement;
    expect(priceHeader.getAttribute('aria-sort')).toBe('ascending');

    const dirBtn = sortBar!.querySelector('button[data-med-stack-sort-dir]') as HTMLButtonElement;
    dirBtn.click();
    fixture.detectChanges();

    expect(firstCellTexts(fixture)).toEqual(['Gamma', 'Beta', 'Alpha']);
    expect(priceHeader.getAttribute('aria-sort')).toBe('descending');
    expect(fixture.componentInstance.sortEvents.at(-1)).toEqual({ field: 'price', order: 'desc' });

    const clearBtn = sortBar!.querySelector('button[data-med-stack-sort-clear]') as HTMLButtonElement;
    clearBtn.click();
    fixture.detectChanges();

    expect(firstCellTexts(fixture)).toEqual(['Gamma', 'Alpha', 'Beta']);
    expect(priceHeader.getAttribute('aria-sort')).toBe('none');
  });

  // F-02 & F-03: pre-set sortField, removableSort=false, sortMode=multiple, lazyLoad, label overrides, render gating
  it('DAT-060.S1: syncs pre-existing sortField on stack mount and keeps select synced when removableSort is false', () => {
    mockMatchMedia(true);

    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items"
          responsiveLayout="stack"
          breakpoint="960px"
          sortField="price"
          sortOrder="desc"
          [removableSort]="false"
        >
          <med-table-column field="name" header="Name" sortable />
          <med-table-column field="price" header="Price" sortable />
        </med-data-table>
      `,
    })
    class PreSortedHostComponent {
      items = ITEMS;
    }

    const fixture = TestBed.createComponent(PreSortedHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('[data-med-stack-sort] select') as HTMLSelectElement;
    expect(select.value).toBe('price');
    expect(fixture.nativeElement.querySelector('[data-med-stack-sort-clear]')).toBeNull();

    // Selecting placeholder while removableSort=false keeps select synced on 'price'
    select.value = '';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(select.value).toBe('price');
  });

  it('DAT-060: supports sortMode="multiple", lazyLoad, custom labels, and omits bar when unstacked or no visible sortable column', () => {
    mockMatchMedia(true);

    @Component({
      standalone: true,
      imports: [DataTableComponent, TableColumnComponent],
      template: `
        <med-data-table
          [value]="items"
          [responsiveLayout]="layout()"
          breakpoint="960px"
          sortMode="multiple"
          [(multiSortMeta)]="multiSortMeta"
          [lazy]="lazy()"
          stackSortLabel="Order by"
          stackSortAscLabel="Up"
          stackSortDescLabel="Down"
          stackSortClearLabel="Reset"
          (sort)="onSort($event)"
          (lazyLoad)="onLazy($event)"
        >
          <med-table-column field="name" header="Name" [sortable]="nameSortable()" />
          <med-table-column field="price" header="Price" [sortable]="priceSortable()" [visible]="priceVisible()" />
        </med-data-table>
      `,
    })
    class AdvancedStackSortHostComponent {
      items = ITEMS;
      layout = signal<'scroll' | 'stack'>('scroll');
      lazy = signal(false);
      nameSortable = signal(true);
      priceSortable = signal(true);
      priceVisible = signal(true);
      multiSortMeta = [{ field: 'price', order: 'asc' as const }];
      sortEvents: { multiSortMeta: readonly { field: string; order: string | null }[] }[] = [];
      lazyEvents: { sortField: string | null; multiSortMeta: readonly { field: string; order: string | null }[] }[] = [];
      onSort(e: { multiSortMeta: readonly { field: string; order: string | null }[] }): void {
        this.sortEvents.push({ multiSortMeta: e.multiSortMeta });
      }
      onLazy(e: { sortField: string | null; multiSortMeta: readonly { field: string; order: string | null }[] }): void {
        this.lazyEvents.push({ sortField: e.sortField, multiSortMeta: e.multiSortMeta });
      }
    }

    const fixture = TestBed.createComponent(AdvancedStackSortHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    // Omitted when unstacked
    expect(fixture.nativeElement.querySelector('[data-med-stack-sort]')).toBeNull();

    // Shown when stacked
    fixture.componentInstance.layout.set('stack');
    fixture.detectChanges();
    const sortBar = fixture.nativeElement.querySelector('[data-med-stack-sort]') as HTMLElement;
    expect(sortBar).not.toBeNull();

    const select = sortBar.querySelector('select[aria-label="Order by"]') as HTMLSelectElement;
    expect(select.value).toBe('price');
    const dirBtn = sortBar.querySelector('button[data-med-stack-sort-dir]') as HTMLButtonElement;
    expect(dirBtn.textContent?.trim()).toBe('Up');
    const clearBtn = sortBar.querySelector('button[data-med-stack-sort-clear]') as HTMLButtonElement;
    expect(clearBtn.textContent?.trim()).toBe('Reset');

    // Select a different column in sortMode="multiple"
    select.value = 'name';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.multiSortMeta).toEqual([{ field: 'name', order: 'asc' }]);
    expect(fixture.componentInstance.sortEvents.at(-1)?.multiSortMeta).toEqual([{ field: 'name', order: 'asc' }]);

    // Toggle direction in multiple mode
    dirBtn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.multiSortMeta).toEqual([{ field: 'name', order: 'desc' }]);
    expect(fixture.componentInstance.sortEvents.at(-1)?.multiSortMeta).toEqual([{ field: 'name', order: 'desc' }]);
    expect(dirBtn.textContent?.trim()).toBe('Down');

    // Lazy mode emits lazyLoad with updated multiSortMeta on select, toggle, and clear
    fixture.componentInstance.lazy.set(true);
    fixture.detectChanges();
    select.value = 'price';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.lazyEvents.at(-1)?.multiSortMeta).toEqual([{ field: 'price', order: 'asc' }]);

    dirBtn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lazyEvents.at(-1)?.multiSortMeta).toEqual([{ field: 'price', order: 'desc' }]);

    clearBtn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.multiSortMeta).toEqual([]);
    expect(fixture.componentInstance.lazyEvents.at(-1)?.multiSortMeta).toEqual([]);

    // Omitted when only sortable column is hidden
    fixture.componentInstance.nameSortable.set(false);
    fixture.componentInstance.priceVisible.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-med-stack-sort]')).toBeNull();
  });
});
