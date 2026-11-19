import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TreeBasicDemo } from './demos/tree-basic.demo';
import { TreeFilterVirtualScrollDemo } from './demos/tree-filter-virtual-scroll.demo';
import { TreeNodeTemplateDemo } from './demos/tree-node-template.demo';

import treeBasicCode from './demos/tree-basic.demo.html?raw';
import treeFilterVirtualScrollCode from './demos/tree-filter-virtual-scroll.demo.html?raw';
import treeNodeTemplateCode from './demos/tree-node-template.demo.html?raw';
import apiEntries from '../../../../content/api/tree.json';
import introContent from '../../../../content/docs/tree-intro.txt?raw';
import filterVirtualScrollContent from '../../../../content/docs/tree-filter-virtual-scroll.txt?raw';
import nodeTemplateContent from '../../../../content/docs/tree-node-template.txt?raw';

const IMPORT_CODE = `import { TreeComponent, type TreeNode } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Tree — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Tree component docs: a vertically indented hierarchy with single, multiple, and checkbox selection modes, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-tree',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TreeBasicDemo, TreeFilterVirtualScrollDemo, TreeNodeTemplateDemo],
  template: `
    <app-component-doc title="Tree" slug="tree">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-tree-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="treeBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="filterVirtualScrollContent" />
    <div class="mt-4">
      <app-tree-filter-virtual-scroll-demo />
      <div class="mt-3"><app-code-block [code]="treeFilterVirtualScrollCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="nodeTemplateContent" />
    <div class="mt-4">
      <app-tree-node-template-demo />
      <div class="mt-3"><app-code-block [code]="treeNodeTemplateCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTree {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly filterVirtualScrollContent = filterVirtualScrollContent;
  protected readonly nodeTemplateContent = nodeTemplateContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly treeBasicCode = treeBasicCode;
  protected readonly treeFilterVirtualScrollCode = treeFilterVirtualScrollCode;
  protected readonly treeNodeTemplateCode = treeNodeTemplateCode;
}
