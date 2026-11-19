import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelectComponent, type TreeNode } from '@medra.dev/ui';

@Component({
  selector: 'app-tree-select-basic-demo',
  imports: [FormsModule, TreeSelectComponent],
  templateUrl: './tree-select-basic.demo.html',
})
export class TreeSelectBasicDemo {
  protected readonly bins: TreeNode[] = [
    {
      label: 'Warehouse A',
      children: [
        { label: 'Aisle 1', children: [{ label: 'Bin 12' }, { label: 'Bin 13' }] },
        { label: 'Aisle 2', children: [{ label: 'Bin 5', selectable: false }] },
      ],
    },
    {
      label: 'Warehouse B',
      children: [{ label: 'Aisle 1', children: [{ label: 'Bin 1' }] }],
    },
  ];

  protected selectedBin: TreeNode | null = null;
}
