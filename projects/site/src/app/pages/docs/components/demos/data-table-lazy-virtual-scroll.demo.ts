import { Component, signal } from '@angular/core';
import { DataTableComponent, TableColumnComponent, type TableLazyLoadEvent } from '@medra.dev/ui';

interface Customer {
  readonly id: number;
  readonly name: string;
  readonly plan: 'Pro' | 'Free';
}

@Component({
  selector: 'app-data-table-lazy-virtual-scroll-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-lazy-virtual-scroll.demo.html',
})
export class DataTableLazyVirtualScrollDemo {
  protected readonly total = 100000;
  protected readonly blockSize = 50;

  // `value` has one entry per record. An entry that is `null` is a row that has not arrived yet, so the table shows a placeholder for it.
  protected readonly rows = signal<(Customer | null)[]>(Array.from({ length: this.total }, () => null));
  protected readonly requests = signal<number[]>([]);

  protected onLazyLoad(event: TableLazyLoadEvent): void {
    this.requests.update((requested) => [...requested, event.first]);
    // Simulates a server answering after a short delay: the block lands at the row indices it covers.
    setTimeout(() => {
      this.rows.update((current) => {
        const next = [...current];
        for (let i = event.first; i < Math.min(event.first + event.rows, this.total); i++) {
          next[i] = { id: i, name: `Row ${i}`, plan: i % 3 === 0 ? 'Pro' : 'Free' };
        }
        return next;
      });
    }, 300);
  }
}
