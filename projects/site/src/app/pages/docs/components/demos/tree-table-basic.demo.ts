import { Component } from '@angular/core';
import { TreeTableComponent, TableColumnComponent, type TreeTableNode } from '@medra/ui';

interface StorageLocation {
  readonly name: string;
  readonly itemCount: number;
  readonly utilization: string;
}

@Component({
  selector: 'app-tree-table-basic-demo',
  imports: [TreeTableComponent, TableColumnComponent],
  templateUrl: './tree-table-basic.demo.html',
})
export class TreeTableBasicDemo {
  protected readonly locations: TreeTableNode<StorageLocation>[] = [
    {
      data: { name: 'Building A', itemCount: 340, utilization: '72%' },
      children: [
        {
          data: { name: 'Room 101', itemCount: 210, utilization: '65%' },
          children: [
            { data: { name: 'Shelf A1', itemCount: 80, utilization: '90%' } },
            { data: { name: 'Shelf A2', itemCount: 130, utilization: '55%' } },
          ],
        },
        {
          data: { name: 'Room 102', itemCount: 130, utilization: '81%' },
          expanded: false,
          children: [{ data: { name: 'Shelf B1', itemCount: 130, utilization: '81%' } }],
        },
      ],
    },
    {
      data: { name: 'Building B', itemCount: 95, utilization: '40%' },
      children: [{ data: { name: 'Room 201', itemCount: 95, utilization: '40%' } }],
    },
  ];
}
