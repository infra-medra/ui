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
import { DataTablePresortDemo } from './demos/data-table-presort.demo';
import { DataTableRemovableSortDemo } from './demos/data-table-removable-sort.demo';
import { DataTableSortMultipleDemo } from './demos/data-table-sort-multiple.demo';
import { DataTableFilterGlobalDemo } from './demos/data-table-filter-global.demo';
import { DataTableColumnFiltersDemo } from './demos/data-table-column-filters.demo';
import { DataTablePaginationDemo } from './demos/data-table-pagination.demo';
import { DataTableProgrammaticPaginationDemo } from './demos/data-table-programmatic-pagination.demo';
import { DataTableScrollVerticalDemo } from './demos/data-table-scroll-vertical.demo';
import { DataTableRowExpansionDemo } from './demos/data-table-row-expansion.demo';
import { DataTableRowGroupSubheaderDemo } from './demos/data-table-row-group-subheader.demo';
import { DataTableRowGroupRowspanDemo } from './demos/data-table-row-group-rowspan.demo';
import { DataTableRowGroupExpandableDemo } from './demos/data-table-row-group-expandable.demo';
import { DataTableSelectionRadioDemo } from './demos/data-table-selection-radio.demo';
import { DataTableRowAriaLabelDemo } from './demos/data-table-row-aria-label.demo';
import { DataTableRowTrackByDemo } from './demos/data-table-row-track-by.demo';
import { DataTableKeyboardNavigationDemo } from './demos/data-table-keyboard-navigation.demo';
import { DataTableSizeDemo } from './demos/data-table-size.demo';
import { DataTableGridLinesDemo } from './demos/data-table-grid-lines.demo';
import { DataTableStripedRowsDemo } from './demos/data-table-striped-rows.demo';
import { DataTableFrozenColumnsDemo } from './demos/data-table-frozen-columns.demo';
import { DataTableFrozenColumnsBothDemo } from './demos/data-table-frozen-columns-both.demo';
import { DataTableFrozenRowsDemo } from './demos/data-table-frozen-rows.demo';
import { DataTableScrollHorizontalDemo } from './demos/data-table-scroll-horizontal.demo';
import { DataTableScrollFlexibleDemo } from './demos/data-table-scroll-flexible.demo';
import { DataTableColumnResizeDemo } from './demos/data-table-column-resize.demo';
import { DataTableColumnResizeExpandDemo } from './demos/data-table-column-resize-expand.demo';
import { DataTableColumnToggleDemo } from './demos/data-table-column-toggle.demo';
import { DataTableColumnGroupsDemo } from './demos/data-table-column-groups.demo';
import { DataTableColumnReorderDemo } from './demos/data-table-column-reorder.demo';
import { DataTableFrozenColumnsUtilityDemo } from './demos/data-table-frozen-columns-utility.demo';
import { DataTableEditCellDemo } from './demos/data-table-edit-cell.demo';
import { DataTableEditRowDemo } from './demos/data-table-edit-row.demo';
import { DataTableEditCellSelectionDemo } from './demos/data-table-edit-cell-selection.demo';
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
import presortCode from './demos/data-table-presort.demo.html?raw';
import removableSortCode from './demos/data-table-removable-sort.demo.html?raw';
import sortMultipleCode from './demos/data-table-sort-multiple.demo.html?raw';
import filterGlobalCode from './demos/data-table-filter-global.demo.html?raw';
import columnFiltersCode from './demos/data-table-column-filters.demo.html?raw';
import paginationCode from './demos/data-table-pagination.demo.html?raw';
import programmaticPaginationCode from './demos/data-table-programmatic-pagination.demo.html?raw';
import scrollVerticalCode from './demos/data-table-scroll-vertical.demo.html?raw';
import rowExpansionCode from './demos/data-table-row-expansion.demo.html?raw';
import rowGroupSubheaderCode from './demos/data-table-row-group-subheader.demo.html?raw';
import rowGroupRowspanCode from './demos/data-table-row-group-rowspan.demo.html?raw';
import rowGroupExpandableCode from './demos/data-table-row-group-expandable.demo.html?raw';
import selectionRadioCode from './demos/data-table-selection-radio.demo.html?raw';
import rowAriaLabelCode from './demos/data-table-row-aria-label.demo.html?raw';
import rowTrackByCode from './demos/data-table-row-track-by.demo.html?raw';
import keyboardNavigationCode from './demos/data-table-keyboard-navigation.demo.html?raw';
import sizeCode from './demos/data-table-size.demo.html?raw';
import gridLinesCode from './demos/data-table-grid-lines.demo.html?raw';
import stripedRowsCode from './demos/data-table-striped-rows.demo.html?raw';
import frozenColumnsCode from './demos/data-table-frozen-columns.demo.html?raw';
import frozenColumnsBothCode from './demos/data-table-frozen-columns-both.demo.html?raw';
import frozenRowsCode from './demos/data-table-frozen-rows.demo.html?raw';
import scrollHorizontalCode from './demos/data-table-scroll-horizontal.demo.html?raw';
import scrollFlexibleCode from './demos/data-table-scroll-flexible.demo.html?raw';
import columnResizeCode from './demos/data-table-column-resize.demo.html?raw';
import columnResizeExpandCode from './demos/data-table-column-resize-expand.demo.html?raw';
import columnToggleCode from './demos/data-table-column-toggle.demo.html?raw';
import columnGroupsCode from './demos/data-table-column-groups.demo.html?raw';
import columnReorderCode from './demos/data-table-column-reorder.demo.html?raw';
import frozenColumnsUtilityCode from './demos/data-table-frozen-columns-utility.demo.html?raw';
import editCellCode from './demos/data-table-edit-cell.demo.html?raw';
import editRowCode from './demos/data-table-edit-row.demo.html?raw';
import editCellSelectionCode from './demos/data-table-edit-cell-selection.demo.html?raw';
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
import presortContent from '../../../../content/docs/data-table-presort.txt?raw';
import removableSortContent from '../../../../content/docs/data-table-removable-sort.txt?raw';
import sortMultipleContent from '../../../../content/docs/data-table-sort-multiple.txt?raw';
import filterGlobalContent from '../../../../content/docs/data-table-filter-global.txt?raw';
import columnFiltersContent from '../../../../content/docs/data-table-column-filters.txt?raw';
import paginationContent from '../../../../content/docs/data-table-pagination.txt?raw';
import programmaticPaginationContent from '../../../../content/docs/data-table-programmatic-pagination.txt?raw';
import scrollVerticalContent from '../../../../content/docs/data-table-scroll-vertical.txt?raw';
import rowExpansionContent from '../../../../content/docs/data-table-row-expansion.txt?raw';
import rowGroupSubheaderContent from '../../../../content/docs/data-table-row-group-subheader.txt?raw';
import rowGroupRowspanContent from '../../../../content/docs/data-table-row-group-rowspan.txt?raw';
import rowGroupExpandableContent from '../../../../content/docs/data-table-row-group-expandable.txt?raw';
import selectionRadioContent from '../../../../content/docs/data-table-selection-radio.txt?raw';
import rowAriaLabelContent from '../../../../content/docs/data-table-row-aria-label.txt?raw';
import rowTrackByContent from '../../../../content/docs/data-table-row-track-by.txt?raw';
import keyboardNavigationContent from '../../../../content/docs/data-table-keyboard-navigation.txt?raw';
import sizeContent from '../../../../content/docs/data-table-size.txt?raw';
import gridLinesContent from '../../../../content/docs/data-table-grid-lines.txt?raw';
import stripedRowsContent from '../../../../content/docs/data-table-striped-rows.txt?raw';
import frozenColumnsContent from '../../../../content/docs/data-table-frozen-columns.txt?raw';
import frozenColumnsBothContent from '../../../../content/docs/data-table-frozen-columns-both.txt?raw';
import frozenRowsContent from '../../../../content/docs/data-table-frozen-rows.txt?raw';
import scrollHorizontalContent from '../../../../content/docs/data-table-scroll-horizontal.txt?raw';
import scrollFlexibleContent from '../../../../content/docs/data-table-scroll-flexible.txt?raw';
import columnResizeContent from '../../../../content/docs/data-table-column-resize.txt?raw';
import columnResizeExpandContent from '../../../../content/docs/data-table-column-resize-expand.txt?raw';
import columnToggleContent from '../../../../content/docs/data-table-column-toggle.txt?raw';
import columnGroupsContent from '../../../../content/docs/data-table-column-groups.txt?raw';
import columnReorderContent from '../../../../content/docs/data-table-column-reorder.txt?raw';
import frozenColumnsUtilityContent from '../../../../content/docs/data-table-frozen-columns-utility.txt?raw';
import editCellContent from '../../../../content/docs/data-table-edit-cell.txt?raw';
import editRowContent from '../../../../content/docs/data-table-edit-row.txt?raw';
import editCellSelectionContent from '../../../../content/docs/data-table-edit-cell-selection.txt?raw';
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
  { id: 'example-presort', label: 'Presort' },
  { id: 'example-removable-sort', label: 'Removable sort' },
  { id: 'example-sort-multiple', label: 'Multiple sort' },
  { id: 'example-filter-global', label: 'Global filter' },
  { id: 'example-column-filters', label: 'Column filters' },
  { id: 'example-pagination', label: 'Pagination' },
  { id: 'example-programmatic-pagination', label: 'Programmatic pagination' },
  { id: 'example-scroll-vertical', label: 'Vertical scroll' },
  { id: 'example-row-expansion', label: 'Row expansion' },
  { id: 'example-row-group-subheader', label: 'Row group subheader' },
  { id: 'example-row-group-rowspan', label: 'Row group row span' },
  { id: 'example-row-group-expandable', label: 'Expandable row groups' },
  { id: 'example-column-resize', label: 'Column resize' },
  { id: 'example-column-resize-expand', label: 'Column resize (expand)' },
  { id: 'example-column-toggle', label: 'Column toggle' },
  { id: 'example-column-groups', label: 'Column groups' },
  { id: 'example-column-reorder', label: 'Column reorder' },
  { id: 'example-edit-cell', label: 'Cell editing' },
  { id: 'example-edit-row', label: 'Row editing' },
  { id: 'example-edit-cell-selection', label: 'Cell editing with selection' },
  { id: 'example-loading', label: 'Loading' },
  { id: 'example-lazy', label: 'Lazy loading' },
  { id: 'example-empty-state', label: 'Empty state' },
  { id: 'example-templates', label: 'Column templates' },
  { id: 'example-conditional-style', label: 'Conditional row style' },
  { id: 'example-stateful', label: 'Persisted state' },
  { id: 'example-export-csv', label: 'CSV export' },
  { id: 'example-row-reorder-events', label: 'Row reorder and events' },
  { id: 'example-selection-radio', label: 'Radio selection' },
  { id: 'example-row-aria-label', label: 'Row labels' },
  { id: 'example-row-track-by', label: 'Row identity' },
  { id: 'example-keyboard-navigation', label: 'Keyboard navigation' },
  { id: 'example-size', label: 'Size' },
  { id: 'example-grid-lines', label: 'Grid lines' },
  { id: 'example-striped-rows', label: 'Striped rows' },
  { id: 'example-frozen-columns', label: 'Frozen columns' },
  { id: 'example-frozen-columns-both', label: 'Frozen columns on both sides' },
  { id: 'example-frozen-columns-utility', label: 'Frozen column with utility columns' },
  { id: 'example-frozen-rows', label: 'Frozen rows' },
  { id: 'example-scroll-horizontal', label: 'Horizontal scroll' },
  { id: 'example-scroll-flexible', label: 'Flexible scroll' },
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
    DataTablePresortDemo,
    DataTableRemovableSortDemo,
    DataTableSortMultipleDemo,
    DataTableFilterGlobalDemo,
    DataTableColumnFiltersDemo,
    DataTablePaginationDemo,
    DataTableProgrammaticPaginationDemo,
    DataTableScrollVerticalDemo,
    DataTableRowExpansionDemo,
    DataTableRowGroupSubheaderDemo,
    DataTableRowGroupRowspanDemo,
    DataTableRowGroupExpandableDemo,
    DataTableColumnResizeDemo,
    DataTableColumnResizeExpandDemo,
    DataTableColumnToggleDemo,
    DataTableColumnGroupsDemo,
    DataTableColumnReorderDemo,
    DataTableEditCellDemo,
    DataTableEditRowDemo,
    DataTableEditCellSelectionDemo,
    DataTableLoadingDemo,
    DataTableLazyDemo,
    DataTableEmptyStateDemo,
    DataTableTemplatesDemo,
    DataTableConditionalStyleDemo,
    DataTableStatefulDemo,
    DataTableExportCsvDemo,
    DataTableRowReorderEventsDemo,
    DataTableSelectionRadioDemo,
    DataTableRowAriaLabelDemo,
    DataTableRowTrackByDemo,
    DataTableKeyboardNavigationDemo,
    DataTableSizeDemo,
    DataTableGridLinesDemo,
    DataTableStripedRowsDemo,
    DataTableFrozenColumnsDemo,
    DataTableFrozenColumnsBothDemo,
    DataTableFrozenColumnsUtilityDemo,
    DataTableFrozenRowsDemo,
    DataTableScrollHorizontalDemo,
    DataTableScrollFlexibleDemo,
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

      <section id="example-presort" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="presortContent" />
        <div class="mt-4">
          <app-data-table-presort-demo />
          <div class="mt-3"><app-code-block [code]="presortCode" /></div>
        </div>
      </section>

      <section id="example-removable-sort" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="removableSortContent" />
        <div class="mt-4">
          <app-data-table-removable-sort-demo />
          <div class="mt-3"><app-code-block [code]="removableSortCode" /></div>
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

      <section id="example-column-filters" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="columnFiltersContent" />
        <div class="mt-4">
          <app-data-table-column-filters-demo />
          <div class="mt-3"><app-code-block [code]="columnFiltersCode" /></div>
        </div>
      </section>

      <section id="example-pagination" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="paginationContent" />
        <div class="mt-4">
          <app-data-table-pagination-demo />
          <div class="mt-3"><app-code-block [code]="paginationCode" /></div>
        </div>
      </section>

      <section id="example-programmatic-pagination" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="programmaticPaginationContent" />
        <div class="mt-4">
          <app-data-table-programmatic-pagination-demo />
          <div class="mt-3"><app-code-block [code]="programmaticPaginationCode" /></div>
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

      <section id="example-row-group-rowspan" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="rowGroupRowspanContent" />
        <div class="mt-4">
          <app-data-table-row-group-rowspan-demo />
          <div class="mt-3"><app-code-block [code]="rowGroupRowspanCode" /></div>
        </div>
      </section>

      <section id="example-row-group-expandable" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="rowGroupExpandableContent" />
        <div class="mt-4">
          <app-data-table-row-group-expandable-demo />
          <div class="mt-3"><app-code-block [code]="rowGroupExpandableCode" /></div>
        </div>
      </section>

      <section id="example-column-resize" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="columnResizeContent" />
        <div class="mt-4">
          <app-data-table-column-resize-demo />
          <div class="mt-3"><app-code-block [code]="columnResizeCode" /></div>
        </div>
      </section>

      <section id="example-column-resize-expand" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="columnResizeExpandContent" />
        <div class="mt-4">
          <app-data-table-column-resize-expand-demo />
          <div class="mt-3"><app-code-block [code]="columnResizeExpandCode" /></div>
        </div>
      </section>

      <section id="example-column-toggle" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="columnToggleContent" />
        <div class="mt-4">
          <app-data-table-column-toggle-demo />
          <div class="mt-3"><app-code-block [code]="columnToggleCode" /></div>
        </div>
      </section>

      <section id="example-column-groups" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="columnGroupsContent" />
        <div class="mt-4">
          <app-data-table-column-groups-demo />
          <div class="mt-3"><app-code-block [code]="columnGroupsCode" /></div>
        </div>
      </section>

      <section id="example-column-reorder" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="columnReorderContent" />
        <div class="mt-4">
          <app-data-table-column-reorder-demo />
          <div class="mt-3"><app-code-block [code]="columnReorderCode" /></div>
        </div>
      </section>

      <section id="example-edit-cell" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="editCellContent" />
        <div class="mt-4">
          <app-data-table-edit-cell-demo />
          <div class="mt-3"><app-code-block [code]="editCellCode" /></div>
        </div>
      </section>

      <section id="example-edit-row" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="editRowContent" />
        <div class="mt-4">
          <app-data-table-edit-row-demo />
          <div class="mt-3"><app-code-block [code]="editRowCode" /></div>
        </div>
      </section>

      <section id="example-edit-cell-selection" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="editCellSelectionContent" />
        <div class="mt-4">
          <app-data-table-edit-cell-selection-demo />
          <div class="mt-3"><app-code-block [code]="editCellSelectionCode" /></div>
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

      <section id="example-row-aria-label" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="rowAriaLabelContent" />
        <div class="mt-4">
          <app-data-table-row-aria-label-demo />
          <div class="mt-3"><app-code-block [code]="rowAriaLabelCode" /></div>
        </div>
      </section>

      <section id="example-row-track-by" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="rowTrackByContent" />
        <div class="mt-4">
          <app-data-table-row-track-by-demo />
          <div class="mt-3"><app-code-block [code]="rowTrackByCode" /></div>
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

      <section id="example-frozen-columns" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="frozenColumnsContent" />
        <div class="mt-4">
          <app-data-table-frozen-columns-demo />
          <div class="mt-3"><app-code-block [code]="frozenColumnsCode" /></div>
        </div>
      </section>

      <section id="example-frozen-columns-both" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="frozenColumnsBothContent" />
        <div class="mt-4">
          <app-data-table-frozen-columns-both-demo />
          <div class="mt-3"><app-code-block [code]="frozenColumnsBothCode" /></div>
        </div>
      </section>

      <section id="example-frozen-columns-utility" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="frozenColumnsUtilityContent" />
        <div class="mt-4">
          <app-data-table-frozen-columns-utility-demo />
          <div class="mt-3"><app-code-block [code]="frozenColumnsUtilityCode" /></div>
        </div>
      </section>

      <section id="example-frozen-rows" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="frozenRowsContent" />
        <div class="mt-4">
          <app-data-table-frozen-rows-demo />
          <div class="mt-3"><app-code-block [code]="frozenRowsCode" /></div>
        </div>
      </section>

      <section id="example-scroll-horizontal" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="scrollHorizontalContent" />
        <div class="mt-4">
          <app-data-table-scroll-horizontal-demo />
          <div class="mt-3"><app-code-block [code]="scrollHorizontalCode" /></div>
        </div>
      </section>

      <section id="example-scroll-flexible" class="mt-10 scroll-mt-24">
        <app-prose class="block" [content]="scrollFlexibleContent" />
        <div class="mt-4">
          <app-data-table-scroll-flexible-demo />
          <div class="mt-3"><app-code-block [code]="scrollFlexibleCode" /></div>
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
  protected readonly presortContent = presortContent;
  protected readonly presortCode = presortCode;
  protected readonly removableSortContent = removableSortContent;
  protected readonly removableSortCode = removableSortCode;
  protected readonly sortMultipleContent = sortMultipleContent;
  protected readonly sortMultipleCode = sortMultipleCode;
  protected readonly filterGlobalContent = filterGlobalContent;
  protected readonly filterGlobalCode = filterGlobalCode;
  protected readonly columnFiltersContent = columnFiltersContent;
  protected readonly columnFiltersCode = columnFiltersCode;
  protected readonly paginationContent = paginationContent;
  protected readonly paginationCode = paginationCode;
  protected readonly programmaticPaginationContent = programmaticPaginationContent;
  protected readonly programmaticPaginationCode = programmaticPaginationCode;
  protected readonly scrollVerticalContent = scrollVerticalContent;
  protected readonly scrollVerticalCode = scrollVerticalCode;
  protected readonly rowExpansionContent = rowExpansionContent;
  protected readonly rowExpansionCode = rowExpansionCode;
  protected readonly rowGroupSubheaderContent = rowGroupSubheaderContent;
  protected readonly rowGroupSubheaderCode = rowGroupSubheaderCode;
  protected readonly rowGroupRowspanContent = rowGroupRowspanContent;
  protected readonly rowGroupRowspanCode = rowGroupRowspanCode;
  protected readonly rowGroupExpandableContent = rowGroupExpandableContent;
  protected readonly rowGroupExpandableCode = rowGroupExpandableCode;
  protected readonly columnResizeContent = columnResizeContent;
  protected readonly columnResizeCode = columnResizeCode;
  protected readonly columnResizeExpandContent = columnResizeExpandContent;
  protected readonly columnResizeExpandCode = columnResizeExpandCode;
  protected readonly columnToggleContent = columnToggleContent;
  protected readonly columnToggleCode = columnToggleCode;
  protected readonly columnGroupsContent = columnGroupsContent;
  protected readonly columnGroupsCode = columnGroupsCode;
  protected readonly columnReorderContent = columnReorderContent;
  protected readonly columnReorderCode = columnReorderCode;
  protected readonly frozenColumnsUtilityContent = frozenColumnsUtilityContent;
  protected readonly frozenColumnsUtilityCode = frozenColumnsUtilityCode;
  protected readonly editCellContent = editCellContent;
  protected readonly editCellCode = editCellCode;
  protected readonly editRowContent = editRowContent;
  protected readonly editRowCode = editRowCode;
  protected readonly editCellSelectionContent = editCellSelectionContent;
  protected readonly editCellSelectionCode = editCellSelectionCode;
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
  protected readonly rowAriaLabelContent = rowAriaLabelContent;
  protected readonly rowAriaLabelCode = rowAriaLabelCode;
  protected readonly rowTrackByContent = rowTrackByContent;
  protected readonly rowTrackByCode = rowTrackByCode;
  protected readonly keyboardNavigationContent = keyboardNavigationContent;
  protected readonly keyboardNavigationCode = keyboardNavigationCode;
  protected readonly sizeContent = sizeContent;
  protected readonly sizeCode = sizeCode;
  protected readonly gridLinesContent = gridLinesContent;
  protected readonly gridLinesCode = gridLinesCode;
  protected readonly stripedRowsContent = stripedRowsContent;
  protected readonly stripedRowsCode = stripedRowsCode;
  protected readonly frozenColumnsContent = frozenColumnsContent;
  protected readonly frozenColumnsCode = frozenColumnsCode;
  protected readonly frozenColumnsBothContent = frozenColumnsBothContent;
  protected readonly frozenColumnsBothCode = frozenColumnsBothCode;
  protected readonly frozenRowsContent = frozenRowsContent;
  protected readonly frozenRowsCode = frozenRowsCode;
  protected readonly scrollHorizontalContent = scrollHorizontalContent;
  protected readonly scrollHorizontalCode = scrollHorizontalCode;
  protected readonly scrollFlexibleContent = scrollFlexibleContent;
  protected readonly scrollFlexibleCode = scrollFlexibleCode;
}
