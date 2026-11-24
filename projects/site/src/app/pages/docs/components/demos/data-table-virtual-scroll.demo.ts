import { Component, computed, signal } from '@angular/core';
import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';

interface ScoreRow {
  readonly id: number;
  readonly name: string;
  readonly score: number;
}

interface VariableRow {
  readonly id: number;
  readonly title: string;
  readonly notes: string;
}

const VARIABLE_NOTES = [
  'Short note.',
  'Medium wrapped row with enough detail to span multiple lines inside the table column when rendered in the docs layout.',
  'Long wrapped row containing several sentences of natural prose so the cell expands across multiple lines in the browser. Variable row height mode lets the table measure each rendered row with ResizeObserver instead of truncating text with an ellipsis, keeping every word readable as you scroll.',
] as const;

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

  protected readonly variableRows: VariableRow[] = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    notes: VARIABLE_NOTES[i % VARIABLE_NOTES.length],
  }));

  protected readonly virtualColFields: readonly string[] = Array.from({ length: 40 }, (_, i) => `c${i}`);
  protected readonly virtualColRows: readonly Record<string, string | number>[] = Array.from({ length: 60 }, (_, r) => {
    const row: Record<string, string | number> = { id: r, item: `Item ${r}` };
    for (let c = 0; c < 40; c++) {
      row[`c${c}`] = `R${r}C${c}`;
    }
    return row;
  });
}
