import { Component } from '@angular/core';
import { TreeComponent, type TreeNode } from '@medra/ui';

@Component({
  selector: 'app-tree-filter-virtual-scroll-demo',
  imports: [TreeComponent],
  templateUrl: './tree-filter-virtual-scroll.demo.html',
})
export class TreeFilterVirtualScrollDemo {
  protected readonly departments: TreeNode[] = Array.from({ length: 30 }, (_, i) => ({
    label: `Department ${String(i + 1).padStart(2, '0')}`,
    children: Array.from({ length: 5 }, (_, j) => ({ label: `Team ${String(i + 1).padStart(2, '0')}.${j + 1}` })),
  }));
}
