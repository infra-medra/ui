import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, TreeSelectComponent, type TreeNode } from '@medra/ui';

@Component({
  selector: 'app-tree-select-loading-demo',
  imports: [FormsModule, ButtonDirective, TreeSelectComponent],
  templateUrl: './tree-select-loading.demo.html',
})
export class TreeSelectLoadingDemo {
  protected readonly loading = signal(false);
  protected readonly bins = signal<TreeNode[]>([]);
  protected selectedBin: TreeNode | null = null;

  protected simulateFetch(): void {
    this.loading.set(true);
    this.bins.set([]);
    setTimeout(() => {
      this.bins.set([
        { label: 'Warehouse A', children: [{ label: 'Aisle 1', children: [{ label: 'Bin 12' }] }] },
        { label: 'Warehouse B', children: [{ label: 'Aisle 1', children: [{ label: 'Bin 1' }] }] },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
