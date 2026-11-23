import { Component, computed, signal } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface ScoreRow {
  readonly id: number;
  readonly name: string;
  readonly score: number;
}

@Component({
  selector: 'app-data-table-virtual-scroll-demo',
  imports: [DataTableComponent, TableColumnComponent],
  templateUrl: './data-table-virtual-scroll.demo.html',
})
export class DataTableVirtualScrollDemo {
  // 10,000 rows, of which the table renders only the ones in view plus a small buffer.
  protected readonly rows: ScoreRow[] = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Row ${i}`, score: (i * 7919) % 10000 }));
  protected readonly pinned: ScoreRow[] = [{ id: -1, name: 'Pinned', score: 0 }];
  protected readonly selected = signal<ScoreRow | null>(null);
  protected readonly selectedLabel = computed(() => this.selected()?.name ?? 'none');
}
