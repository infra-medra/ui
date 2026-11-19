import { Component } from '@angular/core';
import { IconComponent, TreeComponent, TreeNodeTemplateDirective, type TreeNode } from '@medra.dev/ui';

@Component({
  selector: 'app-tree-node-template-demo',
  imports: [TreeComponent, TreeNodeTemplateDirective, IconComponent],
  templateUrl: './tree-node-template.demo.html',
})
export class TreeNodeTemplateDemo {
  protected readonly files: TreeNode[] = [
    {
      label: 'src',
      type: 'folder',
      children: [
        { label: 'app.component.ts', type: 'file' },
        { label: 'app.component.html', type: 'file' },
      ],
    },
    { label: 'README.md', type: 'file' },
  ];
}
