import { Component } from '@angular/core';
import { TreeComponent, type TreeNode } from '@medra.dev/ui';

@Component({
  selector: 'app-tree-basic-demo',
  imports: [TreeComponent],
  templateUrl: './tree-basic.demo.html',
})
export class TreeBasicDemo {
  protected readonly tools: TreeNode[] = [
    {
      label: 'Design tools',
      children: [{ label: 'Figma' }, { label: 'Sketch' }],
    },
    {
      label: 'Development tools',
      children: [{ label: 'VS Code' }, { label: 'IntelliJ IDEA' }, { label: 'Docker Desktop' }],
    },
    {
      label: 'Communication',
      children: [{ label: 'Slack' }, { label: 'Zoom', selectable: false }],
    },
  ];

  protected selectedTools: readonly TreeNode[] | null = [];
}
