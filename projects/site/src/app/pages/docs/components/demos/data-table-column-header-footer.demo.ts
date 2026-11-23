import { Component, signal } from '@angular/core';
import { DataTableComponent, IconComponent, TableColumnComponent, type TableSortCompare } from '@medra.dev/ui';

interface OrderItem {
  readonly id: number;
  readonly item: string;
  readonly price: number;
  readonly status: string;
  readonly statusRank: number;
  readonly version: string;
}

@Component({
  selector: 'app-data-table-column-header-footer-demo',
  imports: [DataTableComponent, TableColumnComponent, IconComponent],
  templateUrl: './data-table-column-header-footer.demo.html',
})
export class DataTableColumnHeaderFooterDemo {
  /** Deliberately unsorted, so each sort in the demo visibly reorders the rows. */
  protected readonly items: OrderItem[] = [
    { id: 1, item: 'Oscilloscope', price: 30, status: 'Done', statusRank: 3, version: '1.10' },
    { id: 2, item: 'Centrifuge', price: 12, status: 'Open', statusRank: 1, version: '1.9' },
    { id: 3, item: 'Pipette set', price: 25, status: 'Blocked', statusRank: 2, version: '1.2' },
    { id: 4, item: 'Microscope', price: 8, status: 'Open', statusRank: 1, version: '1.9' },
    { id: 5, item: 'Balance', price: 19, status: 'Done', statusRank: 3, version: '1.1' },
  ];

  /** Whether the hint under the table is shown; toggled by the button in the Price header. */
  protected readonly hintOpen = signal(false);

  /** Compares versions part by part, so "1.10" sorts after "1.9". */
  protected readonly compareVersions: TableSortCompare<OrderItem> = (a, b) => {
    const left = a.version.split('.').map(Number);
    const right = b.version.split('.').map(Number);
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
      const diff = (left[i] ?? 0) - (right[i] ?? 0);
      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  };

  /** Sum of the prices of the rows the column footer receives. */
  protected sumOf(rows: readonly OrderItem[]): number {
    return rows.reduce((total, row) => total + row.price, 0);
  }

  protected toggleHint(): void {
    this.hintOpen.update((open) => !open);
  }
}
