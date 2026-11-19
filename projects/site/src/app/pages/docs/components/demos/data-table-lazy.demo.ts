import { Component, signal } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface Customer {
  readonly name: string;
  readonly plan: 'Pro' | 'Free';
}

@Component({
  selector: 'app-data-table-lazy-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-lazy.demo.html',
})
export class DataTableLazyDemo {
  // Simulates a server-side data source: DataTable's own `lazy` input never
  // touches this array directly, it only trusts `value()`/`totalRecords()`
  // and asks (via `lazyLoad`) for whatever page/sort it needs next.
  private readonly serverRows: Customer[] = Array.from({ length: 83 }, (_, i) => ({
    name: `Customer ${i + 1}`,
    plan: i % 3 === 0 ? 'Pro' : 'Free',
  }));

  protected readonly rows = signal<Customer[]>([]);
  protected readonly loading = signal(false);

  protected onLazyLoad(event: { first: number; rows: number; sortField: string | null; sortOrder: 'asc' | 'desc' | null }): void {
    this.loading.set(true);
    setTimeout(() => {
      let sorted = [...this.serverRows];
      if (event.sortField && event.sortOrder) {
        const field = event.sortField as keyof Customer;
        sorted.sort((a, b) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0));
        if (event.sortOrder === 'desc') {
          sorted.reverse();
        }
      }
      this.rows.set(sorted.slice(event.first, event.first + event.rows));
      this.loading.set(false);
    }, 400);
  }
}
