import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DataTableBasicDemo } from './demos/data-table-basic.demo';
import { DataTableMultiSortEditDemo } from './demos/data-table-multi-sort-edit.demo';
import { DataTableExportDemo } from './demos/data-table-export.demo';
import { DataTableLazyDemo } from './demos/data-table-lazy.demo';
import { DataTableGroupedRowsDemo } from './demos/data-table-grouped-rows.demo';
import { DataTableReorderEventsDemo } from './demos/data-table-reorder-events.demo';

import dataTableBasicCode from './demos/data-table-basic.demo.html?raw';
import dataTableMultiSortEditCode from './demos/data-table-multi-sort-edit.demo.html?raw';
import dataTableExportCode from './demos/data-table-export.demo.html?raw';
import dataTableLazyCode from './demos/data-table-lazy.demo.html?raw';
import dataTableGroupedRowsCode from './demos/data-table-grouped-rows.demo.html?raw';
import dataTableReorderEventsCode from './demos/data-table-reorder-events.demo.html?raw';
import apiEntries from '../../../../content/api/data-table.json';
import introContent from '../../../../content/docs/data-table-intro.txt?raw';
import multiSortEditContent from '../../../../content/docs/data-table-multi-sort-edit.txt?raw';
import exportContent from '../../../../content/docs/data-table-export.txt?raw';
import lazyContent from '../../../../content/docs/data-table-lazy.txt?raw';
import groupedRowsContent from '../../../../content/docs/data-table-grouped-rows.txt?raw';
import reorderEventsContent from '../../../../content/docs/data-table-reorder-events.txt?raw';

const IMPORT_CODE = `import { DataTableComponent, TableColumnComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'DataTable — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'DataTable component docs: a tabular list with content-projected columns, client-side sort and filter, row selection, and built-in pagination, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-data-table',
  imports: [ComponentDocComponent, 
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    DataTableBasicDemo,
    DataTableMultiSortEditDemo,
    DataTableExportDemo,
    DataTableLazyDemo,
    DataTableGroupedRowsDemo,
    DataTableReorderEventsDemo,
  ],
  template: `
    <app-component-doc title="DataTable" slug="data-table">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-data-table-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="dataTableBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="multiSortEditContent" />
    <div class="mt-4">
      <app-data-table-multi-sort-edit-demo />
      <div class="mt-3"><app-code-block [code]="dataTableMultiSortEditCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="exportContent" />
    <div class="mt-4">
      <app-data-table-export-demo />
      <div class="mt-3"><app-code-block [code]="dataTableExportCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="lazyContent" />
    <div class="mt-4">
      <app-data-table-lazy-demo />
      <div class="mt-3"><app-code-block [code]="dataTableLazyCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="groupedRowsContent" />
    <div class="mt-4">
      <app-data-table-grouped-rows-demo />
      <div class="mt-3"><app-code-block [code]="dataTableGroupedRowsCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="reorderEventsContent" />
    <div class="mt-4">
      <app-data-table-reorder-events-demo />
      <div class="mt-3"><app-code-block [code]="dataTableReorderEventsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDataTable {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly multiSortEditContent = multiSortEditContent;
  protected readonly exportContent = exportContent;
  protected readonly lazyContent = lazyContent;
  protected readonly groupedRowsContent = groupedRowsContent;
  protected readonly reorderEventsContent = reorderEventsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly dataTableBasicCode = dataTableBasicCode;
  protected readonly dataTableMultiSortEditCode = dataTableMultiSortEditCode;
  protected readonly dataTableExportCode = dataTableExportCode;
  protected readonly dataTableLazyCode = dataTableLazyCode;
  protected readonly dataTableGroupedRowsCode = dataTableGroupedRowsCode;
  protected readonly dataTableReorderEventsCode = dataTableReorderEventsCode;
}
