import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataViewComponent } from './data-view.component';

interface Product {
  readonly id: number;
  readonly name: string;
  readonly price: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Widget', price: 30 },
  { id: 2, name: 'Gadget', price: 10 },
  { id: 3, name: 'Gizmo', price: 20 },
];

@Component({
  standalone: true,
  imports: [DataViewComponent],
  template: `
    <med-data-view
      [value]="products"
      [layout]="layout"
      [paginator]="paginator"
      [rows]="rows"
      [sortComparator]="comparator"
      [emptyLabel]="emptyLabel"
    >
      <ng-template #item let-item>
        <p class="item">{{ item.name }} - {{ item.price }}</p>
      </ng-template>
    </med-data-view>
  `,
})
class HostComponent {
  products: Product[] = PRODUCTS;
  layout: 'list' | 'grid' = 'list';
  paginator = false;
  rows = 10;
  comparator: ((a: Product, b: Product) => number) | null = null;
  emptyLabel = 'No results found';
}

function itemTexts(fixture: { nativeElement: HTMLElement }): string[] {
  return Array.from(fixture.nativeElement.querySelectorAll('.item')).map((el) => el.textContent?.trim() ?? '');
}

describe('DataViewComponent', () => {
  function create(configure?: (host: HostComponent) => void): ComponentFixture<HostComponent> {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one projected item per entry in value, in the given order', () => {
    const fixture = create();
    expect(itemTexts(fixture)).toEqual(['Widget - 30', 'Gadget - 10', 'Gizmo - 20']);
  });

  it('renders an empty state when value is empty', () => {
    const fixture = create((host) => (host.products = []));
    expect(itemTexts(fixture)).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No results found');
  });

  it('supports a custom emptyLabel', () => {
    const fixture = create((host) => {
      host.products = [];
      host.emptyLabel = 'Nothing here yet';
    });
    expect(fixture.nativeElement.textContent).toContain('Nothing here yet');
  });

  it('applies grid classes when layout is grid, list classes otherwise', () => {
    const listFixture = create();
    const container = listFixture.nativeElement.querySelector('div') as HTMLElement;
    expect(container.className).toContain('flex-col');

    const gridFixture = create((host) => (host.layout = 'grid'));
    const gridContainer = gridFixture.nativeElement.querySelector('div') as HTMLElement;
    expect(gridContainer.className).toContain('grid');
  });

  it('sortComparator reorders items without mutating the source array', () => {
    const fixture = create((host) => (host.comparator = (a, b) => a.price - b.price));
    expect(itemTexts(fixture)).toEqual(['Gadget - 10', 'Gizmo - 20', 'Widget - 30']);
    expect(fixture.componentInstance.products).toEqual(PRODUCTS); // original order untouched
  });

  it('null sortComparator (default) renders value as given', () => {
    const fixture = create();
    expect(itemTexts(fixture)).toEqual(['Widget - 30', 'Gadget - 10', 'Gizmo - 20']);
  });

  it('paginator=false renders every item, no <med-paginator>', () => {
    const fixture = create();
    expect(itemTexts(fixture).length).toBe(3);
    expect(fixture.nativeElement.querySelector('med-paginator')).toBeNull();
  });

  it('paginator=true slices items to the page size and renders <med-paginator>', () => {
    const fixture = create((host) => {
      host.paginator = true;
      host.rows = 2;
    });
    expect(itemTexts(fixture)).toEqual(['Widget - 30', 'Gadget - 10']);
    expect(fixture.nativeElement.querySelector('med-paginator')).not.toBeNull();
  });

  it('paginator is hidden once the (empty) dataset has zero items, even with paginator=true', () => {
    const fixture = create((host) => {
      host.paginator = true;
      host.products = [];
    });
    expect(fixture.nativeElement.querySelector('med-paginator')).toBeNull();
  });

  it('sorts before paginating (page 2 reflects sorted order, not source order)', () => {
    const fixture = create((host) => {
      host.paginator = true;
      host.rows = 2;
      host.comparator = (a, b) => a.price - b.price;
    });
    const dataView = fixture.debugElement.query(By.directive(DataViewComponent)).componentInstance as DataViewComponent<Product>;
    dataView.first.set(2);
    fixture.detectChanges();
    expect(itemTexts(fixture)).toEqual(['Widget - 30']); // 3rd item by price, page 2 of size 2
  });
});

describe('DataViewComponent (header/footer/empty templates, filter, loading, lazy)', () => {
  @Component({
    standalone: true,
    imports: [DataViewComponent],
    template: `
      <med-data-view
        [value]="products"
        [paginator]="paginator"
        [rows]="rows"
        [filterPredicate]="filterPredicate"
        [loading]="loading"
        [lazy]="lazy"
        [lazyLoadOnInit]="lazyLoadOnInit"
        [totalRecords]="totalRecords"
        [rowsPerPageOptions]="rowsPerPageOptions"
        (lazyLoad)="onLazyLoad($event)"
      >
        @if (withHeader) {
          <ng-template #header let-items>
            <p class="header-marker">{{ items.length }} products</p>
          </ng-template>
        }
        @if (withFooter) {
          <ng-template #footer let-items>
            <p class="footer-marker">Total: {{ items.length }}</p>
          </ng-template>
        }
        @if (withEmpty) {
          <ng-template #empty>
            <p class="empty-marker">Nothing to show</p>
          </ng-template>
        }
        <ng-template #item let-item>
          <p class="item">{{ item.name }} - {{ item.price }}</p>
        </ng-template>
      </med-data-view>
    `,
  })
  class ExtHostComponent {
    products: Product[] = PRODUCTS;
    paginator = false;
    rows = 10;
    filterPredicate: ((item: Product, query: string) => boolean) | null = null;
    loading = false;
    lazy = false;
    lazyLoadOnInit = true;
    totalRecords = 0;
    rowsPerPageOptions: readonly number[] | null = null;
    withHeader = false;
    withFooter = false;
    withEmpty = false;
    onLazyLoad = jest.fn();
  }

  function createExt(configure?: (h: ExtHostComponent) => void) {
    const fixture = TestBed.createComponent(ExtHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  describe('header/footer/empty templates', () => {
    it('renders #header/#footer bound to value, before/after the list', () => {
      const fixture = createExt((h) => {
        h.withHeader = true;
        h.withFooter = true;
      });
      expect(fixture.nativeElement.querySelector('.header-marker')?.textContent).toBe('3 products');
      expect(fixture.nativeElement.querySelector('.footer-marker')?.textContent).toBe('Total: 3');
    });

    it('renders #empty instead of the plain emptyLabel text when projected', () => {
      const fixture = createExt((h) => {
        h.products = [];
        h.withEmpty = true;
      });
      expect(fixture.nativeElement.querySelector('.empty-marker')?.textContent).toBe('Nothing to show');
      expect(fixture.nativeElement.textContent).not.toContain('No results found');
    });
  });

  describe('filterPredicate', () => {
    const startsWith = (item: Product, query: string) => item.name.toLowerCase().startsWith(query.toLowerCase());

    it('renders no filter box when filterPredicate is unset', () => {
      const fixture = createExt();
      expect(fixture.nativeElement.querySelector('input[type="search"]')).toBeNull();
    });

    it('narrows the visible items as the box is typed into', () => {
      const fixture = createExt((h) => (h.filterPredicate = startsWith));
      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
      input.value = 'G';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(itemTexts(fixture)).toEqual(['Gadget - 10', 'Gizmo - 20']);
    });
  });

  describe('loading', () => {
    it('shows the list, not a loading row, by default', () => {
      const fixture = createExt();
      expect(itemTexts(fixture).length).toBe(3);
      expect(fixture.nativeElement.textContent).not.toContain('Loading...');
    });

    it('loading replaces the list entirely with a loading row', () => {
      const fixture = createExt((h) => (h.loading = true));
      expect(itemTexts(fixture)).toEqual([]);
      expect(fixture.nativeElement.textContent).toContain('Loading...');
    });
  });

  describe('lazy', () => {
    it('does not slice value() client-side — value() is already treated as the current page', () => {
      const fixture = createExt((h) => {
        h.lazy = true;
        h.paginator = true;
        h.rows = 2;
        h.totalRecords = 100;
        h.products = PRODUCTS.slice(0, 2); // server already returned just this page
      });
      expect(itemTexts(fixture)).toEqual(['Widget - 30', 'Gadget - 10']);
    });

    it('uses totalRecords, not value().length, for the paginator total', () => {
      const fixture = createExt((h) => {
        h.lazy = true;
        h.paginator = true;
        h.totalRecords = 100;
        h.products = PRODUCTS.slice(0, 2);
      });
      const paginator = fixture.nativeElement.querySelector('med-paginator');
      expect(paginator).not.toBeNull();
      expect(paginator?.textContent).toContain('100');
    });

    it('emits lazyLoad on init by default (lazyLoadOnInit)', () => {
      const fixture = createExt((h) => (h.lazy = true));
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledWith({ first: 0, rows: 10 });
    });

    it('lazyLoadOnInit=false skips the initial emit', () => {
      const fixture = createExt((h) => {
        h.lazy = true;
        h.lazyLoadOnInit = false;
      });
      expect(fixture.componentInstance.onLazyLoad).not.toHaveBeenCalled();
    });

    it('emits lazyLoad again when first changes', () => {
      const fixture = createExt((h) => {
        h.lazy = true;
        h.paginator = true;
        h.totalRecords = 100;
      });
      fixture.componentInstance.onLazyLoad.mockClear();
      const dataView = fixture.debugElement.query(By.directive(DataViewComponent)).componentInstance as DataViewComponent<Product>;
      dataView.first.set(10);
      fixture.detectChanges();
      expect(fixture.componentInstance.onLazyLoad).toHaveBeenCalledWith({ first: 10, rows: 10 });
    });

    it('does not emit lazyLoad at all when lazy is false', () => {
      const fixture = createExt();
      expect(fixture.componentInstance.onLazyLoad).not.toHaveBeenCalled();
    });
  });

  describe('rowsPerPageOptions', () => {
    it('forwards through to the embedded paginator', () => {
      const fixture = createExt((h) => {
        h.paginator = true;
        h.rowsPerPageOptions = [5, 10, 25];
      });
      const select = fixture.nativeElement.querySelector('med-paginator select');
      expect(select).not.toBeNull();
      const optionValues = Array.from(select!.querySelectorAll('option')).map((o) => (o as HTMLOptionElement).value);
      expect(optionValues).toEqual(['5', '10', '25']);
    });
  });
});
