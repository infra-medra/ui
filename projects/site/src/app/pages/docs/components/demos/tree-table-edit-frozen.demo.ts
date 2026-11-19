import { Component, signal } from '@angular/core';
import { InputTextDirective, TreeTableComponent, TableColumnComponent, type TreeTableNode } from '@medra/ui';

interface StorageLocation {
  readonly name: string;
  readonly itemCount: number;
  readonly utilization: string;
}

function replaceNode(
  nodes: readonly TreeTableNode<StorageLocation>[],
  target: TreeTableNode<StorageLocation>,
  itemCount: number,
): TreeTableNode<StorageLocation>[] {
  return nodes.map((node) => {
    if (node === target) {
      return { ...node, data: { ...node.data, itemCount } };
    }
    if (node.children) {
      return { ...node, children: replaceNode(node.children, target, itemCount) };
    }
    return node;
  });
}

@Component({
  selector: 'app-tree-table-edit-frozen-demo',
  imports: [TreeTableComponent, TableColumnComponent, InputTextDirective],
  templateUrl: './tree-table-edit-frozen.demo.html',
})
export class TreeTableEditFrozenDemo {
  protected readonly locations = signal<TreeTableNode<StorageLocation>[]>([
    {
      data: { name: 'Building A', itemCount: 340, utilization: '72%' },
      children: [
        { data: { name: 'Room 101', itemCount: 210, utilization: '65%' } },
        { data: { name: 'Room 102', itemCount: 130, utilization: '81%' } },
      ],
    },
    {
      data: { name: 'Building B', itemCount: 95, utilization: '40%' },
      children: [{ data: { name: 'Room 201', itemCount: 95, utilization: '40%' } }],
    },
  ]);

  protected onEditComplete(event: { node: TreeTableNode<StorageLocation>; field: string; value: unknown }): void {
    this.locations.update((nodes) => replaceNode(nodes, event.node, Number(event.value)));
  }
}
