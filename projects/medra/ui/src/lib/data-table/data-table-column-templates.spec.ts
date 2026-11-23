import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataTableComponent } from './data-table.component';
import { TableColumnComponent } from './table-column.component';
import { TableLazyLoadEvent, TableSortMeta, TableSortOrder } from './data-table.types';

/**
 * Cases for the column header template (DAT-053), the column footer (DAT-054) and custom column sorting (DAT-055) of
 * `med-data-table` and `med-table-column`. The stacked footer case (DAT-054.S6) uses the same controllable
 * `window.matchMedia` mock as `data-table-responsive-stack.spec.ts`.
 */

type MediaChangeListener = (event: { matches: boolean; media: string }) => void;

/** Controllable `window.matchMedia`: evaluates `(width < Npx)` against a width the test sets and fires `change` on resize. */
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

  private matches(media: string): boolean {
    const match = /\(width\s*<\s*(\d+(?:\.\d+)?)px\)/.exec(media);
    return match ? this.width < Number(match[1]) : false;
  }
}

interface Product {
  name: string;
  price: number;
  stock: number;
}

/** Three products in an order that differs from the ascending price order (10, 20, 30). */
const PRODUCTS: Product[] = [
  { name: 'Widget', price: 30, stock: 5 },
  { name: 'Gadget', price: 10, stock: 0 },
  { name: 'Gizmo', price: 20, stock: 12 },
];

/** Rows whose global filter "Keep" leaves the prices 10 and 20. */
const FILTERABLE_PRODUCTS: Product[] = [
  { name: 'Keep A', price: 10, stock: 1 },
  { name: 'Keep B', price: 20, stock: 1 },
  { name: 'Drop C', price: 30, stock: 1 },
];

/** Sum of the `price` of every row a footer template receives. */
function sumPrice(rows: readonly Product[]): number {
  return rows.reduce((total, row) => total + row.price, 0);
}

function create<T>(host: Type<T>): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [host] });
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture;
}

function headerCells(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead tr th'));
}

/** The header cell whose text starts with `label`. */
function headerCell(fixture: ComponentFixture<unknown>, label: string): HTMLElement {
  const cell = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead th')).find((th) => th.textContent!.trim().startsWith(label));
  expect(cell).toBeDefined();
  return cell!;
}

/** Trimmed text of the body cell at `index` in every body row. */
function bodyCellTexts(fixture: ComponentFixture<unknown>, index: number): string[] {
  return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr')).map((tr) => tr.querySelectorAll('td')[index].textContent!.trim());
}

/** Trimmed text of every footer cell, one array per footer row. */
function footerCellTexts(fixture: ComponentFixture<unknown>): string[][] {
  return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tfoot tr')).map((tr) =>
    Array.from(tr.children).map((cell) => cell.textContent!.trim()),
  );
}

/** Whether a stacked footer cell is hidden: the `hidden` attribute, the `hidden` class or the stacked-hidden marker. */
function isHidden(cell: HTMLElement): boolean {
  return cell.hidden || cell.classList.contains('hidden') || cell.hasAttribute('data-med-stack-hidden');
}

function exportedCsv(fixture: ComponentFixture<unknown>): string {
  let capturedCsv = '';
  const spy = jest.spyOn(globalThis, 'Blob' as never).mockImplementation(((parts: string[]) => {
    capturedCsv = parts[0];
    return {} as Blob;
  }) as never);
  fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance.exportCSV();
  spy.mockRestore();
  return capturedCsv;
}

/* ------------------------------------------------------------------------------------------------ */
/* DAT-053: data table column header template                                                        */
/* ------------------------------------------------------------------------------------------------ */

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" ariaLabel="Header template">
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" sortable>
        <ng-template #header>
          <span class="header-icon" aria-hidden="true">$</span>
          <span class="custom-title">Price (USD)</span>
        </ng-template>
        <ng-template let-row>{{ row.price }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class HeaderTemplateHostComponent {
  products: Product[] = PRODUCTS;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" ariaLabel="Header action">
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" sortable>
        <ng-template #header>
          <button type="button" class="header-action" (click)="onAction()" (keydown)="onKey($event)">Info</button>
        </ng-template>
        <ng-template let-row>{{ row.price }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class HeaderActionHostComponent {
  products: Product[] = PRODUCTS;
  clicks = 0;
  keys: string[] = [];

  onAction(): void {
    this.clicks++;
  }

  onKey(event: KeyboardEvent): void {
    this.keys.push(event.key);
  }
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" ariaLabel="Column filter">
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" [columnFilter]="true">
        <ng-template #header><span class="custom-title">Price (USD)</span></ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class HeaderTemplateFilterHostComponent {
  products: Product[] = PRODUCTS;
}

describe('DataTableComponent column header template (DAT-053)', () => {
  // DAT-053.S1
  it('DAT-053.S1: the #header template replaces the header text, keeps the sort indicator and still renders the body cells', () => {
    const fixture = create(HeaderTemplateHostComponent);

    const price = headerCells(fixture)[1];
    expect(price.textContent!.replace(/\s+/g, ' ')).toContain('Price (USD)');
    expect(price.querySelector('.header-icon')).not.toBeNull();
    expect(price.textContent).not.toMatch(/Price(?! \(USD\))/);
    expect(price.querySelector('med-icon')).not.toBeNull();
    expect(bodyCellTexts(fixture, 1)).toEqual(['30', '10', '20']);
  });

  // DAT-053.S2
  it('DAT-053.S2: a click on plain template text sorts ascending and Enter on the header sorts descending', () => {
    const fixture = create(HeaderTemplateHostComponent);
    const price = headerCells(fixture)[1];

    (fixture.nativeElement.querySelector('.custom-title') as HTMLElement).click();
    fixture.detectChanges();
    expect(bodyCellTexts(fixture, 1)).toEqual(['10', '20', '30']);
    expect(price.getAttribute('aria-sort')).toBe('ascending');

    price.focus();
    price.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(bodyCellTexts(fixture, 1)).toEqual(['30', '20', '10']);
    expect(price.getAttribute('aria-sort')).toBe('descending');
  });

  // DAT-053.S3
  it('DAT-053.S3: a button in the #header template receives its click and key presses without sorting the column', () => {
    const fixture = create(HeaderActionHostComponent);
    const host = fixture.componentInstance;
    const button = fixture.nativeElement.querySelector('.header-action') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();
    expect(host.clicks).toBe(1);

    button.focus();
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    button.dispatchEvent(enter);
    button.dispatchEvent(space);
    fixture.detectChanges();

    expect(host.keys).toEqual(['Enter', ' ']);
    expect(enter.defaultPrevented).toBe(false);
    expect(space.defaultPrevented).toBe(false);
    expect(bodyCellTexts(fixture, 1)).toEqual(['30', '10', '20']);
    expect(headerCells(fixture)[1].getAttribute('aria-sort')).toBe('none');
  });

  // DAT-053.S4
  it('DAT-053.S4: the column filter and the CSV export still use the plain header text', () => {
    const fixture = create(HeaderTemplateFilterHostComponent);

    const filterButton = fixture.nativeElement.querySelector('button[aria-label="Filter Price"]');
    expect(filterButton).not.toBeNull();
    expect(headerCells(fixture)[1].textContent).toContain('Price (USD)');

    const csv = exportedCsv(fixture);
    expect(csv.split('\n')[0]).toBe('Name,Price');
  });
});

/* ------------------------------------------------------------------------------------------------ */
/* DAT-054: data table column footer                                                                  */
/* ------------------------------------------------------------------------------------------------ */

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" ariaLabel="Text footer">
      <med-table-column field="name" header="Name" footer="Total" />
      <med-table-column field="price" header="Price" />
    </med-data-table>
  `,
})
class TextFooterHostComponent {
  products: Product[] = PRODUCTS;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="products"
      [paginator]="true"
      [rows]="1"
      [globalFilterValue]="filter"
      [globalFilterFields]="['name']"
      ariaLabel="Filtered footer"
    >
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price">
        <ng-template #footer let-rows>{{ sum(rows) }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class FilteredFooterHostComponent {
  products: Product[] = FILTERABLE_PRODUCTS;
  filter = 'Keep';
  sum = sumPrice;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" ariaLabel="Footer group and column footer">
      <ng-template #footerGroup>
        <tr class="footer-group-row">
          <td class="footer-cell" colspan="3">Total: 3 products</td>
        </tr>
      </ng-template>
      <med-table-column field="name" header="Name" footer="Total" />
      <med-table-column field="price" header="Price" />
      <med-table-column field="stock" header="Stock" />
    </med-data-table>
  `,
})
class FooterGroupAndColumnHostComponent {
  products: Product[] = PRODUCTS;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" [reorderableColumns]="true" ariaLabel="Footer order">
      <med-table-column field="name" header="Name" footer="A foot" />
      <med-table-column field="price" header="Price" footer="B foot" [visible]="false" />
      <med-table-column field="stock" header="Stock" footer="C foot" />
    </med-data-table>
  `,
})
class FooterOrderHostComponent {
  products: Product[] = PRODUCTS;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" [scrollable]="true" scrollHeight="200px" ariaLabel="Frozen footer">
      <med-table-column field="name" header="Name" footer="Total" [frozen]="true" width="300px" />
      <med-table-column field="price" header="Price" width="400px" />
      <med-table-column field="stock" header="Stock" width="400px" />
    </med-data-table>
  `,
})
class FrozenFooterHostComponent {
  products: Product[] = PRODUCTS;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" responsiveLayout="stack" ariaLabel="Stacked footer">
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price" footer="Sum: 30" />
    </med-data-table>
  `,
})
class StackedFooterHostComponent {
  products: Product[] = PRODUCTS;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="products" [lazy]="true" [totalRecords]="2" ariaLabel="Lazy footer">
      <med-table-column field="name" header="Name" />
      <med-table-column field="price" header="Price">
        <ng-template #footer let-rows>{{ sum(rows) }}</ng-template>
      </med-table-column>
    </med-data-table>
  `,
})
class LazyFooterHostComponent {
  products: Product[] = [
    { name: 'Lazy A', price: 5, stock: 0 },
    { name: 'Lazy B', price: 7, stock: 0 },
  ];
  sum = sumPrice;
}

describe('DataTableComponent column footer (DAT-054)', () => {
  // DAT-054.S1
  it('DAT-054.S1: a column footer text renders in one footer row, one cell per column in column order', () => {
    const fixture = create(TextFooterHostComponent);

    expect(footerCellTexts(fixture)).toEqual([['Total', '']]);
  });

  // DAT-054.S2
  it('DAT-054.S2: a #footer template receives the filtered rows of every page, not only the current page', () => {
    const fixture = create(FilteredFooterHostComponent);

    expect(bodyCellTexts(fixture, 0)).toHaveLength(1);
    expect(footerCellTexts(fixture)).toEqual([['', '30']]);
  });

  // DAT-054.S3
  it('DAT-054.S3: with a #footerGroup template, the footer group row comes first and the column footer row after it', () => {
    const fixture = create(FooterGroupAndColumnHostComponent);

    const rows = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tfoot tr'));
    expect(rows).toHaveLength(2);
    expect(rows[0].classList.contains('footer-group-row')).toBe(true);
    expect(footerCellTexts(fixture)[1]).toEqual(['Total', '', '']);
  });

  // DAT-054.S4
  it('DAT-054.S4: the footer follows column visibility and order, with no cell for a hidden column', () => {
    const fixture = create(FooterOrderHostComponent);

    expect(footerCellTexts(fixture)).toEqual([['A foot', 'C foot']]);

    // The application moves Stock (C) before Name (A) by keyboard, as a user does.
    headerCell(fixture, 'Stock').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(footerCellTexts(fixture)).toEqual([['C foot', 'A foot']]);
  });

  // DAT-054.S5
  it('DAT-054.S5: a frozen column footer cell keeps the left offset of that column body cells', () => {
    const fixture = create(FrozenFooterHostComponent);

    const viewport = fixture.nativeElement.querySelector('[data-med-scroll-viewport]') as HTMLElement;
    expect(viewport).not.toBeNull();
    viewport.scrollLeft = viewport.scrollWidth;
    viewport.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    const footCell = fixture.nativeElement.querySelector('tfoot tr td') as HTMLElement;
    const bodyCell = fixture.nativeElement.querySelector('tbody tr td') as HTMLElement;
    expect(bodyCell.style.left).not.toBe('');
    expect(footCell.style.left).toBe(bodyCell.style.left);
  });

  // DAT-054.S6
  describe('while stacked', () => {
    const viewport = new ViewportMock();

    beforeEach(() => viewport.install());
    afterEach(() => viewport.uninstall());

    it('DAT-054.S6: the column footer row is a block, labels the footer with its column and hides an empty footer cell', () => {
      viewport.width = 500;
      const fixture = create(StackedFooterHostComponent);

      const footRow = fixture.nativeElement.querySelector('tfoot tr') as HTMLElement;
      expect(footRow.classList.contains('block')).toBe(true);

      const [nameCell, priceCell] = Array.from(footRow.children) as HTMLElement[];
      expect(priceCell.querySelector(':scope > [aria-hidden="true"]')?.textContent?.trim()).toBe('Price');
      expect(priceCell.textContent).toContain('Sum: 30');
      expect(isHidden(nameCell)).toBe(true);
    });
  });

  // DAT-054.S7
  it('DAT-054.S7: a lazy table gives the #footer template the current value', () => {
    const fixture = create(LazyFooterHostComponent);

    expect(footerCellTexts(fixture)).toEqual([['', '12']]);
  });
});

/* ------------------------------------------------------------------------------------------------ */
/* DAT-055: data table custom column sorting                                                         */
/* ------------------------------------------------------------------------------------------------ */

interface TaskRow {
  name: string;
  status: string;
  statusRank: number;
}

interface ReleaseRow {
  name: string;
  team: string;
  version: string;
}

/** Compares dotted version numbers part by part, so "1.9" sorts before "1.10". */
function compareVersionStrings(a: string, b: string): number {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

const TASK_ROWS: TaskRow[] = [
  { name: 'Ship', status: 'Done', statusRank: 3 },
  { name: 'Fix', status: 'Open', statusRank: 1 },
  { name: 'Test', status: 'Blocked', statusRank: 2 },
];

const SORT_BY_RANK_TEMPLATE = `
  <med-data-table [value]="tasks" [(sortField)]="sortField" [(sortOrder)]="sortOrder" ariaLabel="Custom sort">
    <med-table-column field="name" header="Name" />
    <med-table-column field="status" header="Status" sortable sortBy="statusRank" />
  </med-data-table>
`;

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: SORT_BY_RANK_TEMPLATE,
})
class SortByHostComponent {
  tasks: TaskRow[] = TASK_ROWS;
  sortField: string | null = null;
  sortOrder: TableSortOrder = null;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: SORT_BY_RANK_TEMPLATE,
})
class PresortHostComponent {
  tasks: TaskRow[] = TASK_ROWS;
  sortField: string | null = 'status';
  sortOrder: TableSortOrder = 'desc';
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="releases" ariaLabel="Version sort">
      <med-table-column field="name" header="Name" />
      <med-table-column field="version" header="Version" sortable [sortCompare]="compareVersions" />
    </med-data-table>
  `,
})
class VersionSortHostComponent {
  releases: ReleaseRow[] = [
    { name: 'Alpha', team: 'Core', version: '1.10' },
    { name: 'Beta', team: 'Core', version: '1.9' },
    { name: 'Gamma', team: 'Core', version: '1.2' },
  ];
  compareVersions = (a: unknown, b: unknown): number => compareVersionStrings((a as ReleaseRow).version, (b as ReleaseRow).version);
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table
      [value]="members"
      sortMode="multiple"
      [(multiSortMeta)]="multiSortMeta"
      ariaLabel="Multiple sort"
    >
      <med-table-column field="team" header="Team" sortable />
      <med-table-column field="name" header="Name" />
      <med-table-column field="version" header="Version" sortable [sortCompare]="compareVersions" />
    </med-data-table>
  `,
})
class MultiSortVersionHostComponent {
  members: ReleaseRow[] = [
    { name: 'Ada', team: 'Analytical', version: '1.10' },
    { name: 'Grace', team: 'Analytical', version: '1.9' },
    { name: 'Alan', team: 'Logic', version: '1.2' },
  ];
  multiSortMeta: TableSortMeta[] = [{ field: 'team', order: 'asc' }];
  compareVersions = (a: unknown, b: unknown): number => compareVersionStrings((a as ReleaseRow).version, (b as ReleaseRow).version);
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableColumnComponent],
  template: `
    <med-data-table [value]="tasks" [lazy]="true" [totalRecords]="3" (lazyLoad)="onLazyLoad($event)" ariaLabel="Lazy custom sort">
      <med-table-column field="name" header="Name" />
      <med-table-column field="status" header="Status" sortable sortBy="statusRank" [sortCompare]="compareRank" />
    </med-data-table>
  `,
})
class LazyCustomSortHostComponent {
  tasks: TaskRow[] = TASK_ROWS;
  lazyEvents: TableLazyLoadEvent[] = [];
  compareRank = (a: unknown, b: unknown): number => (a as TaskRow).statusRank - (b as TaskRow).statusRank;

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.lazyEvents.push(event);
  }
}

describe('DataTableComponent custom column sorting (DAT-055)', () => {
  // DAT-055.S1
  it('DAT-055.S1: a header click sorts by the sortBy property, keeps sortField on the field and sets aria-sort', () => {
    const fixture = create(SortByHostComponent);
    const host = fixture.componentInstance;

    headerCell(fixture, 'Status').click();
    fixture.detectChanges();

    expect(bodyCellTexts(fixture, 0)).toEqual(['Fix', 'Test', 'Ship']);
    expect(host.sortField).toBe('status');
    expect(headerCell(fixture, 'Status').getAttribute('aria-sort')).toBe('ascending');
  });

  // DAT-055.S2
  it('DAT-055.S2: a sortCompare function orders the rows ascending on the first click and descending on the second', () => {
    const fixture = create(VersionSortHostComponent);

    headerCell(fixture, 'Version').click();
    fixture.detectChanges();
    expect(bodyCellTexts(fixture, 1)).toEqual(['1.2', '1.9', '1.10']);

    headerCell(fixture, 'Version').click();
    fixture.detectChanges();
    expect(bodyCellTexts(fixture, 1)).toEqual(['1.10', '1.9', '1.2']);
  });

  // DAT-055.S3
  it('DAT-055.S3: Shift+click adds the custom-compared column to multiSortMeta and orders within the team by its sortCompare', () => {
    const fixture = create(MultiSortVersionHostComponent);
    const host = fixture.componentInstance;

    headerCell(fixture, 'Version').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    fixture.detectChanges();

    expect(bodyCellTexts(fixture, 1)).toEqual(['Grace', 'Ada', 'Alan']);
    expect(host.multiSortMeta).toEqual([
      { field: 'team', order: 'asc' },
      { field: 'version', order: 'asc' },
    ]);
  });

  // DAT-055.S4
  it('DAT-055.S4: a sortField and sortOrder present on the first render are ordered by the sortBy property', () => {
    const fixture = create(PresortHostComponent);

    expect(bodyCellTexts(fixture, 0)).toEqual(['Ship', 'Test', 'Fix']);
  });

  // DAT-055.S5
  it('DAT-055.S5: in lazy mode a header click keeps the order of value and emits lazyLoad with the field', () => {
    const fixture = create(LazyCustomSortHostComponent);
    const host = fixture.componentInstance;

    headerCell(fixture, 'Status').click();
    fixture.detectChanges();

    expect(bodyCellTexts(fixture, 0)).toEqual(['Ship', 'Fix', 'Test']);
    const last = host.lazyEvents[host.lazyEvents.length - 1];
    expect(last.sortField).toBe('status');
    expect(last.sortOrder).toBe('asc');
  });
});
