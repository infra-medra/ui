import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DataTableBasicDemo } from './demos/data-table-basic.demo';
import { DataTableSelectionSingleDemo } from './demos/data-table-selection-single.demo';
import { DataTableSelectionMultipleDemo } from './demos/data-table-selection-multiple.demo';
import { DataTableSortSingleDemo } from './demos/data-table-sort-single.demo';
import { DataTableSortMultipleDemo } from './demos/data-table-sort-multiple.demo';
import { DataTableFilterGlobalDemo } from './demos/data-table-filter-global.demo';
import { DataTablePaginationDemo } from './demos/data-table-pagination.demo';
import { DataTableScrollVerticalDemo } from './demos/data-table-scroll-vertical.demo';
import { DataTableRowExpansionDemo } from './demos/data-table-row-expansion.demo';
import { DataTableRowGroupSubheaderDemo } from './demos/data-table-row-group-subheader.demo';
import { DataTableSelectionRadioDemo } from './demos/data-table-selection-radio.demo';
import { DataTableKeyboardNavigationDemo } from './demos/data-table-keyboard-navigation.demo';
import { DataTableSizeDemo } from './demos/data-table-size.demo';
import { DataTableGridLinesDemo } from './demos/data-table-grid-lines.demo';
import { DataTableStripedRowsDemo } from './demos/data-table-striped-rows.demo';
import { DataTableColumnResizeDemo } from './demos/data-table-column-resize.demo';
import { DataTableEditCellDemo } from './demos/data-table-edit-cell.demo';
import { DataTableLoadingDemo } from './demos/data-table-loading.demo';
import { DataTableLazyDemo } from './demos/data-table-lazy.demo';
import { DataTableEmptyStateDemo } from './demos/data-table-empty-state.demo';
import { DataTableTemplatesDemo } from './demos/data-table-templates.demo';
import { DataTableConditionalStyleDemo } from './demos/data-table-conditional-style.demo';
import { DataTableStatefulDemo } from './demos/data-table-stateful.demo';
import { DataTableExportCsvDemo } from './demos/data-table-export-csv.demo';
import { DataTableRowReorderEventsDemo } from './demos/data-table-row-reorder-events.demo';

import basicCode from './demos/data-table-basic.demo.html?raw';
import selectionSingleCode from './demos/data-table-selection-single.demo.html?raw';
import selectionMultipleCode from './demos/data-table-selection-multiple.demo.html?raw';
import sortSingleCode from './demos/data-table-sort-single.demo.html?raw';
import sortMultipleCode from './demos/data-table-sort-multiple.demo.html?raw';
import filterGlobalCode from './demos/data-table-filter-global.demo.html?raw';
import paginationCode from './demos/data-table-pagination.demo.html?raw';
import scrollVerticalCode from './demos/data-table-scroll-vertical.demo.html?raw';
import rowExpansionCode from './demos/data-table-row-expansion.demo.html?raw';
import rowGroupSubheaderCode from './demos/data-table-row-group-subheader.demo.html?raw';
import selectionRadioCode from './demos/data-table-selection-radio.demo.html?raw';
import keyboardNavigationCode from './demos/data-table-keyboard-navigation.demo.html?raw';
import sizeCode from './demos/data-table-size.demo.html?raw';
import gridLinesCode from './demos/data-table-grid-lines.demo.html?raw';
import stripedRowsCode from './demos/data-table-striped-rows.demo.html?raw';
import columnResizeCode from './demos/data-table-column-resize.demo.html?raw';
import editCellCode from './demos/data-table-edit-cell.demo.html?raw';
import loadingCode from './demos/data-table-loading.demo.html?raw';
import lazyCode from './demos/data-table-lazy.demo.html?raw';
import emptyStateCode from './demos/data-table-empty-state.demo.html?raw';
import templatesCode from './demos/data-table-templates.demo.html?raw';
import conditionalStyleCode from './demos/data-table-conditional-style.demo.html?raw';
import statefulCode from './demos/data-table-stateful.demo.html?raw';
import exportCsvCode from './demos/data-table-export-csv.demo.html?raw';
import rowReorderEventsCode from './demos/data-table-row-reorder-events.demo.html?raw';
import apiEntries from '../../../../content/api/data-table.json';
import introContent from '../../../../content/docs/data-table-intro.txt?raw';
import basicContent from '../../../../content/docs/data-table-basic.txt?raw';
import selectionSingleContent from '../../../../content/docs/data-table-selection-single.txt?raw';
import selectionMultipleContent from '../../../../content/docs/data-table-selection-multiple.txt?raw';
import sortSingleContent from '../../../../content/docs/data-table-sort-single.txt?raw';
import sortMultipleContent from '../../../../content/docs/data-table-sort-multiple.txt?raw';
import filterGlobalContent from '../../../../content/docs/data-table-filter-global.txt?raw';
import paginationContent from '../../../../content/docs/data-table-pagination.txt?raw';
import scrollVerticalContent from '../../../../content/docs/data-table-scroll-vertical.txt?raw';
import rowExpansionContent from '../../../../content/docs/data-table-row-expansion.txt?raw';
import rowGroupSubheaderContent from '../../../../content/docs/data-table-row-group-subheader.txt?raw';
import selectionRadioContent from '../../../../content/docs/data-table-selection-radio.txt?raw';
import keyboardNavigationContent from '../../../../content/docs/data-table-keyboard-navigation.txt?raw';
import sizeContent from '../../../../content/docs/data-table-size.txt?raw';
import gridLinesContent from '../../../../content/docs/data-table-grid-lines.txt?raw';
import stripedRowsContent from '../../../../content/docs/data-table-striped-rows.txt?raw';
import columnResizeContent from '../../../../content/docs/data-table-column-resize.txt?raw';
import editCellContent from '../../../../content/docs/data-table-edit-cell.txt?raw';
import loadingContent from '../../../../content/docs/data-table-loading.txt?raw';
import lazyContent from '../../../../content/docs/data-table-lazy.txt?raw';
import emptyStateContent from '../../../../content/docs/data-table-empty-state.txt?raw';
import templatesContent from '../../../../content/docs/data-table-templates.txt?raw';
import conditionalStyleContent from '../../../../content/docs/data-table-conditional-style.txt?raw';
import statefulContent from '../../../../content/docs/data-table-stateful.txt?raw';
import exportCsvContent from '../../../../content/docs/data-table-export-csv.txt?raw';
import rowReorderEventsContent from '../../../../content/docs/data-table-row-reorder-events.txt?raw';

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

/** The examples of the page, in page order: they feed the "On this page" index and name each example section. */
const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-selection-single', label: 'Single selection' },
  { id: 'example-selection-multiple', label: 'Multiple selection' },
  { id: 'example-sort-single', label: 'Single sort' },
  { id: 'example-sort-multiple', label: 'Multiple sort' },
  { id: 'example-filter-global', label: 'Global filter' },
  { id: 'example-pagination', label: 'Pagination' },
  { id: 'example-scroll-vertical', label: 'Vertical scroll' },
  { id: 'example-row-expansion', label: 'Row expansion' },
  { id: 'example-row-group-subheader', label: 'Row group subheader' },
  { id: 'example-column-resize', label: 'Column resize' },
  { id: 'example-edit-cell', label: 'Cell editing' },
  { id: 'example-loading', label: 'Loading' },
  { id: 'example-lazy', label: 'Lazy loading' },
  { id: 'example-empty-state', label: 'Empty state' },
  { id: 'example-templates', label: 'Column templates' },
  { id: 'example-conditional-style', label: 'Conditional row style' },
  { id: 'example-stateful', label: 'Persisted state' },
  { id: 'example-export-csv', label: 'CSV export' },
  { id: 'example-row-reorder-events', label: 'Row reorder and events' },
  { id: 'example-selection-radio', label: 'Radio selection' },
  { id: 'example-keyboard-navigation', label: 'Keyboard navigation' },
  { id: 'example-size', label: 'Size' },
  { id: 'example-grid-lines', label: 'Grid lines' },
  { id: 'example-striped-rows', label: 'Striped rows' },
] as const;

@Component({
  selector: 'app-docs-data-table',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    DataTableBasicDemo,
    DataTableSelectionSingleDemo,
    DataTableSelectionMultipleDemo,
    DataTableSortSingleDemo,
    DataTableSortMultipleDemo,
    DataTableFilterGlobalDemo,
    DataTablePaginationDemo,
    DataTableScrollVerticalDemo,
    DataTableRowExpansionDemo,
    DataTableRowGroupSubheaderDemo,
    DataTableColumnResizeDemo,
    DataTableEditCellDemo,
    DataTableLoadingDemo,
    DataTableLazyDemo,
    DataTableEmptyStateDemo,
    DataTableTemplatesDemo,
    DataTableConditionalStyleDemo,
    DataTableStatefulDemo,
    DataTableExportCsvDemo,
    DataTableRowReorderEventsDemo,
    DataTableSelectionRadioDemo,
    DataTableKeyboardNavigationDemo,
    DataTableSizeDemo,
    DataTableGridLinesDemo,
    DataTableStripedRowsDemo,
  ],
  template: `
    <app-component-doc title="DataTable" slug="data-table" [examples]="examples">
      <app-prose class="mt-4 block" [content]="introContent" />

      <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
      <app-code-block [code]="importCode" />

      <section id="example-basic" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="basicContent" />
        <div class="mt-4">
          <app-data-table-basic-demo />
          <div class="mt-3"><app-code-block [code]="basicCode" /></div>
        </div>
      </section>

      <section id="example-selection-single" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="selectionSingleContent" />
        <div class="mt-4">
          <app-data-table-selection-single-demo />
          <div class="mt-3"><app-code-block [code]="selectionSingleCode" /></div>
        </div>
      </section>

      <section id="example-selection-multiple" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="selectionMultipleContent" />
        <div class="mt-4">
          <app-data-table-selection-multiple-demo />
          <div class="mt-3"><app-code-block [code]="selectionMultipleCode" /></div>
        </div>
      </section>

      <section id="example-sort-single" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="sortSingleContent" />
        <div class="mt-4">
          <app-data-table-sort-single-demo />
          <div class="mt-3"><app-code-block [code]="sortSingleCode" /></div>
        </div>
      </section>

      <section id="example-sort-multiple" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="sortMultipleContent" />
        <div class="mt-4">
          <app-data-table-sort-multiple-demo />
          <div class="mt-3"><app-code-block [code]="sortMultipleCode" /></div>
        </div>
      </section>

      <section id="example-filter-global" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="filterGlobalContent" />
        <div class="mt-4">
          <app-data-table-filter-global-demo />
          <div class="mt-3"><app-code-block [code]="filterGlobalCode" /></div>
        </div>
      </section>

      <section id="example-pagination" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="paginationContent" />
        <div class="mt-4">
          <app-data-table-pagination-demo />
          <div class="mt-3"><app-code-block [code]="paginationCode" /></div>
        </div>
      </section>

      <section id="example-scroll-vertical" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="scrollVerticalContent" />
        <div class="mt-4">
          <app-data-table-scroll-vertical-demo />
          <div class="mt-3"><app-code-block [code]="scrollVerticalCode" /></div>
        </div>
      </section>

      <section id="example-row-expansion" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="rowExpansionContent" />
        <div class="mt-4">
          <app-data-table-row-expansion-demo />
          <div class="mt-3"><app-code-block [code]="rowExpansionCode" /></div>
        </div>
      </section>

      <section id="example-row-group-subheader" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="rowGroupSubheaderContent" />
        <div class="mt-4">
          <app-data-table-row-group-subheader-demo />
          <div class="mt-3"><app-code-block [code]="rowGroupSubheaderCode" /></div>
        </div>
      </section>

      <section id="example-column-resize" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="columnResizeContent" />
        <div class="mt-4">
          <app-data-table-column-resize-demo />
          <div class="mt-3"><app-code-block [code]="columnResizeCode" /></div>
        </div>
      </section>

      <section id="example-edit-cell" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="editCellContent" />
        <div class="mt-4">
          <app-data-table-edit-cell-demo />
          <div class="mt-3"><app-code-block [code]="editCellCode" /></div>
        </div>
      </section>

      <section id="example-loading" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="loadingContent" />
        <div class="mt-4">
          <app-data-table-loading-demo />
          <div class="mt-3"><app-code-block [code]="loadingCode" /></div>
        </div>
      </section>

      <section id="example-lazy" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="lazyContent" />
        <div class="mt-4">
          <app-data-table-lazy-demo />
          <div class="mt-3"><app-code-block [code]="lazyCode" /></div>
        </div>
      </section>

      <section id="example-empty-state" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="emptyStateContent" />
        <div class="mt-4">
          <app-data-table-empty-state-demo />
          <div class="mt-3"><app-code-block [code]="emptyStateCode" /></div>
        </div>
      </section>

      <section id="example-templates" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="templatesContent" />
        <div class="mt-4">
          <app-data-table-templates-demo />
          <div class="mt-3"><app-code-block [code]="templatesCode" /></div>
        </div>
      </section>

      <section id="example-conditional-style" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="conditionalStyleContent" />
        <div class="mt-4">
          <app-data-table-conditional-style-demo />
          <div class="mt-3"><app-code-block [code]="conditionalStyleCode" /></div>
        </div>
      </section>

      <section id="example-stateful" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="statefulContent" />
        <div class="mt-4">
          <app-data-table-stateful-demo />
          <div class="mt-3"><app-code-block [code]="statefulCode" /></div>
        </div>
      </section>

      <section id="example-export-csv" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="exportCsvContent" />
        <div class="mt-4">
          <app-data-table-export-csv-demo />
          <div class="mt-3"><app-code-block [code]="exportCsvCode" /></div>
        </div>
      </section>

      <section id="example-row-reorder-events" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="rowReorderEventsContent" />
        <div class="mt-4">
          <app-data-table-row-reorder-events-demo />
          <div class="mt-3"><app-code-block [code]="rowReorderEventsCode" /></div>
        </div>
      </section>

      <section id="example-selection-radio" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="selectionRadioContent" />
        <div class="mt-4">
          <app-data-table-selection-radio-demo />
          <div class="mt-3"><app-code-block [code]="selectionRadioCode" /></div>
        </div>
      </section>

      <section id="example-keyboard-navigation" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="keyboardNavigationContent" />
        <div class="mt-4">
          <app-data-table-keyboard-navigation-demo />
          <div class="mt-3"><app-code-block [code]="keyboardNavigationCode" /></div>
        </div>
      </section>

      <section id="example-size" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="sizeContent" />
        <div class="mt-4">
          <app-data-table-size-demo />
          <div class="mt-3"><app-code-block [code]="sizeCode" /></div>
        </div>
      </section>

      <section id="example-grid-lines" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="gridLinesContent" />
        <div class="mt-4">
          <app-data-table-grid-lines-demo />
          <div class="mt-3"><app-code-block [code]="gridLinesCode" /></div>
        </div>
      </section>

      <section id="example-striped-rows" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="stripedRowsContent" />
        <div class="mt-4">
          <app-data-table-striped-rows-demo />
          <div class="mt-3"><app-code-block [code]="stripedRowsCode" /></div>
        </div>
      </section>

      <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDataTable {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly basicContent = basicContent;
  protected readonly basicCode = basicCode;
  protected readonly selectionSingleContent = selectionSingleContent;
  protected readonly selectionSingleCode = selectionSingleCode;
  protected readonly selectionMultipleContent = selectionMultipleContent;
  protected readonly selectionMultipleCode = selectionMultipleCode;
  protected readonly sortSingleContent = sortSingleContent;
  protected readonly sortSingleCode = sortSingleCode;
  protected readonly sortMultipleContent = sortMultipleContent;
  protected readonly sortMultipleCode = sortMultipleCode;
  protected readonly filterGlobalContent = filterGlobalContent;
  protected readonly filterGlobalCode = filterGlobalCode;
  protected readonly paginationContent = paginationContent;
  protected readonly paginationCode = paginationCode;
  protected readonly scrollVerticalContent = scrollVerticalContent;
  protected readonly scrollVerticalCode = scrollVerticalCode;
  protected readonly rowExpansionContent = rowExpansionContent;
  protected readonly rowExpansionCode = rowExpansionCode;
  protected readonly rowGroupSubheaderContent = rowGroupSubheaderContent;
  protected readonly rowGroupSubheaderCode = rowGroupSubheaderCode;
  protected readonly columnResizeContent = columnResizeContent;
  protected readonly columnResizeCode = columnResizeCode;
  protected readonly editCellContent = editCellContent;
  protected readonly editCellCode = editCellCode;
  protected readonly loadingContent = loadingContent;
  protected readonly loadingCode = loadingCode;
  protected readonly lazyContent = lazyContent;
  protected readonly lazyCode = lazyCode;
  protected readonly emptyStateContent = emptyStateContent;
  protected readonly emptyStateCode = emptyStateCode;
  protected readonly templatesContent = templatesContent;
  protected readonly templatesCode = templatesCode;
  protected readonly conditionalStyleContent = conditionalStyleContent;
  protected readonly conditionalStyleCode = conditionalStyleCode;
  protected readonly statefulContent = statefulContent;
  protected readonly statefulCode = statefulCode;
  protected readonly exportCsvContent = exportCsvContent;
  protected readonly exportCsvCode = exportCsvCode;
  protected readonly rowReorderEventsContent = rowReorderEventsContent;
  protected readonly rowReorderEventsCode = rowReorderEventsCode;
  protected readonly selectionRadioContent = selectionRadioContent;
  protected readonly selectionRadioCode = selectionRadioCode;
  protected readonly keyboardNavigationContent = keyboardNavigationContent;
  protected readonly keyboardNavigationCode = keyboardNavigationCode;
  protected readonly sizeContent = sizeContent;
  protected readonly sizeCode = sizeCode;
  protected readonly gridLinesContent = gridLinesContent;
  protected readonly gridLinesCode = gridLinesCode;
  protected readonly stripedRowsContent = stripedRowsContent;
  protected readonly stripedRowsCode = stripedRowsCode;
}
