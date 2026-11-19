import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TreeTableBasicDemo } from './demos/tree-table-basic.demo';
import { TreeTableResizableVirtualScrollDemo } from './demos/tree-table-resizable-virtual-scroll.demo';
import { TreeTableEditFrozenDemo } from './demos/tree-table-edit-frozen.demo';

import treeTableBasicCode from './demos/tree-table-basic.demo.html?raw';
import treeTableResizableVirtualScrollCode from './demos/tree-table-resizable-virtual-scroll.demo.html?raw';
import treeTableEditFrozenCode from './demos/tree-table-edit-frozen.demo.html?raw';
import apiEntries from '../../../../content/api/tree-table.json';
import introContent from '../../../../content/docs/tree-table-intro.txt?raw';
import resizableVirtualScrollContent from '../../../../content/docs/tree-table-resizable-virtual-scroll.txt?raw';
import editFrozenContent from '../../../../content/docs/tree-table-edit-frozen.txt?raw';

const IMPORT_CODE = `import { TreeTableComponent, TableColumnComponent, type TreeTableNode } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'TreeTable — MedraUi',
  meta: [
    {
      name: 'description',
      content: "TreeTable component docs: DataTable's own content-projected column model applied to hierarchical, expandable rows, with a live example and the full API reference.",
    },
  ],
};

@Component({
  selector: 'app-docs-tree-table',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TreeTableBasicDemo, TreeTableResizableVirtualScrollDemo, TreeTableEditFrozenDemo],
  template: `
    <app-component-doc title="TreeTable" slug="tree-table">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-tree-table-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="treeTableBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="resizableVirtualScrollContent" />
    <div class="mt-4">
      <app-tree-table-resizable-virtual-scroll-demo />
      <div class="mt-3"><app-code-block [code]="treeTableResizableVirtualScrollCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="editFrozenContent" />
    <div class="mt-4">
      <app-tree-table-edit-frozen-demo />
      <div class="mt-3"><app-code-block [code]="treeTableEditFrozenCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTreeTable {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly resizableVirtualScrollContent = resizableVirtualScrollContent;
  protected readonly editFrozenContent = editFrozenContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly treeTableBasicCode = treeTableBasicCode;
  protected readonly treeTableResizableVirtualScrollCode = treeTableResizableVirtualScrollCode;
  protected readonly treeTableEditFrozenCode = treeTableEditFrozenCode;
}
