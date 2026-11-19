import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TreeSelectBasicDemo } from './demos/tree-select-basic.demo';
import { TreeSelectFilterableDemo } from './demos/tree-select-filterable.demo';
import { TreeSelectLoadingDemo } from './demos/tree-select-loading.demo';

import treeSelectBasicCode from './demos/tree-select-basic.demo.html?raw';
import treeSelectFilterableCode from './demos/tree-select-filterable.demo.html?raw';
import treeSelectLoadingCode from './demos/tree-select-loading.demo.html?raw';
import apiEntries from '../../../../content/api/tree-select.json';
import introContent from '../../../../content/docs/tree-select-intro.txt?raw';
import filterableContent from '../../../../content/docs/tree-select-filterable.txt?raw';
import loadingContent from '../../../../content/docs/tree-select-loading.txt?raw';

const IMPORT_CODE = `import { TreeSelectComponent, type TreeNode } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'TreeSelect — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'TreeSelect component docs: a Select-style trigger that opens a Tree picker in a floating panel, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-tree-select',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TreeSelectBasicDemo, TreeSelectFilterableDemo, TreeSelectLoadingDemo],
  template: `
    <app-component-doc title="TreeSelect" slug="tree-select">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-tree-select-basic-demo />
      <div class="mt-3"><app-code-block [code]="treeSelectBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="filterableContent" />
    <div class="mt-4">
      <app-tree-select-filterable-demo />
      <div class="mt-3"><app-code-block [code]="treeSelectFilterableCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="loadingContent" />
    <div class="mt-4">
      <app-tree-select-loading-demo />
      <div class="mt-3"><app-code-block [code]="treeSelectLoadingCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTreeSelect {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly filterableContent = filterableContent;
  protected readonly loadingContent = loadingContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly treeSelectBasicCode = treeSelectBasicCode;
  protected readonly treeSelectFilterableCode = treeSelectFilterableCode;
  protected readonly treeSelectLoadingCode = treeSelectLoadingCode;
}
