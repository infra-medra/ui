import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DataViewBasicDemo } from './demos/data-view-basic.demo';
import { DataViewTemplatesFilterDemo } from './demos/data-view-templates-filter.demo';
import { DataViewLazyDemo } from './demos/data-view-lazy.demo';

import dataViewBasicCode from './demos/data-view-basic.demo.html?raw';
import dataViewTemplatesFilterCode from './demos/data-view-templates-filter.demo.html?raw';
import dataViewLazyCode from './demos/data-view-lazy.demo.html?raw';
import apiEntries from '../../../../content/api/data-view.json';
import introContent from '../../../../content/docs/data-view-intro.txt?raw';
import templatesFilterContent from '../../../../content/docs/data-view-templates-filter.txt?raw';
import lazyContent from '../../../../content/docs/data-view-lazy.txt?raw';

const IMPORT_CODE = `import { DataViewComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'DataView — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'DataView component docs: a list-or-grid renderer for arbitrary item data with consumer-templated content and optional pagination, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-data-view',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, DataViewBasicDemo, DataViewTemplatesFilterDemo, DataViewLazyDemo],
  template: `
    <app-component-doc title="DataView" slug="data-view">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-data-view-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="dataViewBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="templatesFilterContent" />
    <div class="mt-4">
      <app-data-view-templates-filter-demo />
      <div class="mt-3"><app-code-block [code]="dataViewTemplatesFilterCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="lazyContent" />
    <div class="mt-4">
      <app-data-view-lazy-demo />
      <div class="mt-3"><app-code-block [code]="dataViewLazyCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDataView {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly templatesFilterContent = templatesFilterContent;
  protected readonly lazyContent = lazyContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly dataViewBasicCode = dataViewBasicCode;
  protected readonly dataViewTemplatesFilterCode = dataViewTemplatesFilterCode;
  protected readonly dataViewLazyCode = dataViewLazyCode;
}
