import { Component, computed, signal } from '@angular/core';
import { DataTableComponent, TableColumnComponent, type TableColumnFilters } from '@medra.dev/ui';

interface ProductRelease {
  readonly id: number;
  readonly name: string;
  readonly price: number;
  /** ISO calendar date; date rules compare it as a local day. */
  readonly released: string;
}

@Component({
  selector: 'app-data-table-column-filters-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-column-filters.demo.html',
})
export class DataTableColumnFiltersDemo {
  protected readonly products: ProductRelease[] = [
    { id: 1, name: 'Widget', price: 25, released: '2026-03-09' },
    { id: 2, name: 'Gadget', price: 40, released: '2026-03-10' },
    { id: 3, name: 'Widget Pro', price: 60, released: '2026-03-11' },
    { id: 4, name: 'Sprocket', price: 12, released: '2026-04-02' },
    { id: 5, name: 'Gizmo', price: 85, released: '2026-02-20' },
  ];

  protected readonly filters = signal<TableColumnFilters>({});

  /** Names the columns that currently hold a rule, read back from the two-way `columnFilters` model. */
  protected readonly activeFields = computed(() => Object.keys(this.filters()).join(', ') || 'none');
}
