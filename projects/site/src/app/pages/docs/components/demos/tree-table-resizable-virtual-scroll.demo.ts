import { Component } from '@angular/core';
import { TreeTableComponent, TableColumnComponent, type TreeTableNode } from '@medra/ui';

interface StorageLocation {
  readonly name: string;
  readonly itemCount: number;
  readonly utilization: string;
}

@Component({
  selector: 'app-tree-table-resizable-virtual-scroll-demo',
  imports: [TreeTableComponent, TableColumnComponent],
  templateUrl: './tree-table-resizable-virtual-scroll.demo.html',
})
export class TreeTableResizableVirtualScrollDemo {
  protected readonly locations: TreeTableNode<StorageLocation>[] = Array.from({ length: 25 }, (_, i) => ({
    data: { name: `Building ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ''}`, itemCount: 100 + i * 7, utilization: `${40 + (i % 50)}%` },
    children: [
      { data: { name: `Room ${i + 1}01`, itemCount: 50 + i * 3, utilization: `${30 + (i % 60)}%` } },
      { data: { name: `Room ${i + 1}02`, itemCount: 40 + i * 2, utilization: `${20 + (i % 70)}%` } },
    ],
  }));
}
