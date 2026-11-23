import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableSortMeta } from './data-table.types';

/**
 * Follow-up cases for DAT-054 (stacked column footer utility cells) and DAT-055 (the subheader grouping key keeps the
 * default comparison in multiple sort mode). The stacked case uses the same controllable `window.matchMedia` mock as
 * `data-table-responsive-stack.spec.ts`.
 */

type MediaChangeListener = (event: { matches: boolean; media: string }) => void;

/** Controllable `window.matchMedia`: evaluates `(width < Npx)` against a width the test sets. */
class ViewportMock {
  width = 1280;

  install(): void {
    this.width = 1280;
    window.matchMedia = jest.fn((media: string) => {
      const matches = this.matches(media);
      const listeners = new Set<MediaChangeListener>();
      return {
        media,
        matches,
        onchange: null,
        addEventListener: (_type: string, listener: MediaChangeListener) => listeners.add(listener),
        removeEventListener: (_type: string, listener: MediaChangeListener) => listeners.delete(listener),
        addListener: (listener: MediaChangeListener) => listeners.add(listener),
        removeListener: (listener: MediaChangeListener) => listeners.delete(listener),
        dispatchEvent: () => true,
      } as unknown as MediaQueryList;
    }) as unknown as typeof window.matchMedia;
  }

  uninstall(): void {
    delete (window as { matchMedia?: unknown }).matchMedia;
  }

  private matches(media: string): boolean {
    const match = /\(width\s*<\s*(\d+(?:\.\d+)?)px\)/.exec(media);
    return match ? this.width < Number(match[1]) : false;
  }
}

function create<T>(host: Type<T>): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [host] });
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture;
}

/** Whether a stacked footer cell is hidden: the `hidden` attribute or the `hidden` class. */
function isHidden(cell: HTMLElement): boolean {
  return cell.hidden || cell.classList.contains('hidden');
}

interface Product {
  name: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { name: 'Widget', price: 30 },
  { name: 'Gadget', price: 10 },
];

/* ------------------------------------------------------------------------------------------------ */
/* DAT-054: stacked column footer hides the utility cells                                            */
/* ------------------------------------------------------------------------------------------------ */

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" responsiveLayout="stack" selectionMode="multiple" dataKey="name" ariaLabel="Stacked selection footer">
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" footer="Sum: 40" />
    </med-data-table>
  `,
})
class StackedSelectionFooterHostComponent {
  products: Product[] = PRODUCTS;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" responsiveLayout="stack" editMode="row" dataKey="name" ariaLabel="Stacked row edit footer">
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" footer="Sum: 40" />
    </med-data-table>
  `,
})
class StackedRowEditFooterHostComponent {
  products: Product[] = PRODUCTS;
}

describe('DataTableComponent stacked column footer utility cells (DAT-054)', () => {
  const viewport = new ViewportMock();

  beforeEach(() => viewport.install());
  afterEach(() => viewport.uninstall());

  it('DAT-054: while stacked with selectionMode="multiple", the empty footer selection cell is hidden', () => {
    viewport.width = 500;
    const fixture = create(StackedSelectionFooterHostComponent);

    const footRow = fixture.nativeElement.querySelector('tfoot tr[data-med-column-footer]') as HTMLElement;
    const cells = Array.from(footRow.children) as HTMLElement[];
    expect(cells).toHaveLength(3);
    expect(isHidden(cells[0])).toBe(true);
    expect(isHidden(cells[2])).toBe(false);
    expect(cells[2].textContent).toContain('Sum: 40');
  });

  it('DAT-054: while stacked with editMode="row", the empty footer row-actions cell is hidden', () => {
    viewport.width = 500;
    const fixture = create(StackedRowEditFooterHostComponent);

    const footRow = fixture.nativeElement.querySelector('tfoot tr[data-med-column-footer]') as HTMLElement;
    const cells = Array.from(footRow.children) as HTMLElement[];
    expect(cells).toHaveLength(3);
    expect(isHidden(cells[2])).toBe(true);
    expect(isHidden(cells[1])).toBe(false);
  });

  it('DAT-054: outside the stacked layout, the footer selection cell stays visible', () => {
    viewport.width = 1280;
    const fixture = create(StackedSelectionFooterHostComponent);

    const footRow = fixture.nativeElement.querySelector('tfoot tr[data-med-column-footer]') as HTMLElement;
    expect(isHidden(footRow.children[0] as HTMLElement)).toBe(false);
  });
});

/* ------------------------------------------------------------------------------------------------ */
/* DAT-055: multiple sort with subheader grouping keeps the default group comparison                 */
/* ------------------------------------------------------------------------------------------------ */

interface CategoryRow {
  name: string;
  category: string;
  /** Orders the categories opposite to their default (alphabetical) order. */
  categoryRank: number;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="rows"
      rowGroupMode="subheader"
      groupRowsBy="category"
      sortMode="multiple"
      [(multiSortMeta)]="multiSortMeta"
      ariaLabel="Grouped multiple sort"
    >
      <med-table-column field="name" header="Name" sortable />
      <med-table-column field="category" header="Category" sortable sortBy="categoryRank" [sortCompare]="compareRank" />
    </med-data-table>
  `,
})
class GroupedMultiSortHostComponent {
  rows: CategoryRow[] = [
    { name: 'Zeta', category: 'Alpha', categoryRank: 2 },
    { name: 'Bolt', category: 'Beta', categoryRank: 1 },
    { name: 'Axle', category: 'Alpha', categoryRank: 2 },
    { name: 'Cog', category: 'Beta', categoryRank: 1 },
  ];
  multiSortMeta: TableSortMeta[] = [{ field: 'name', order: 'asc' }];
  compareRank = (a: unknown, b: unknown): number => (a as CategoryRow).categoryRank - (b as CategoryRow).categoryRank;
}

/** Trimmed names of the data rows (rows with one cell per column), skipping the full-width subheader rows. */
function dataRowNames(fixture: ComponentFixture<unknown>): string[] {
  return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr'))
    .filter((tr) => tr.querySelectorAll('td').length === 2)
    .map((tr) => tr.querySelectorAll('td')[0].textContent!.trim());
}

describe('DataTableComponent multiple sort with subheader grouping (DAT-055)', () => {
  it('DAT-055: the grouping column sortBy/sortCompare does not reorder the groups; groups follow the default field order', () => {
    const fixture = create(GroupedMultiSortHostComponent);

    expect(dataRowNames(fixture)).toEqual(['Axle', 'Zeta', 'Bolt', 'Cog']);
  });

  it('DAT-055: a multiSortMeta entry on the grouping column still leaves the groups in default ascending order', () => {
    TestBed.configureTestingModule({ imports: [GroupedMultiSortHostComponent] });
    const fixture = TestBed.createComponent(GroupedMultiSortHostComponent);
    fixture.componentInstance.multiSortMeta = [
      { field: 'category', order: 'desc' },
      { field: 'name', order: 'desc' },
    ];
    fixture.detectChanges();

    expect(dataRowNames(fixture)).toEqual(['Zeta', 'Axle', 'Cog', 'Bolt']);
  });
});
