import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, contentChild, input } from '@angular/core';
import { TableColumnAlign, TableFilterMatchMode, TableFilterType } from './data-table.types';

/**
 * Pure column *metadata*, declared as a content child of `<med-data-table>` (`<med-table-column
 * field="name" header="Name" sortable />`) — same "children declared directly in the consumer's
 * template" precedent Tabs/Accordion/SplitterPanel already established, rather than a `columns`
 * data-array input. Renders nothing itself (`host: { class: 'hidden' }`, same convention
 * Menu/Drawer use for a component that's only ever read by its parent, never displayed at its own
 * declaration site): `DataTableComponent` reads the whole `contentChildren(TableColumnComponent)`
 * list to drive its own `<thead>`/`<tbody>` entirely from its own template — there's no click or
 * other event that needs to bubble back up from inside a column the way Accordion's header click
 * does, so unlike `AccordionHost`, no DI coordinator is needed here at all.
 *
 * `field` is a plain `string` key into each row (`row[field]`), not
 * `keyof T` — `DataTableComponent<T>` stays fully generic while this
 * component itself isn't, so there's no generic parameter here to constrain
 * against; the same relaxation this library already accepts for
 * `DataViewComponent`'s `sortComparator` staying a plain function rather
 * than a field-name API.
 *
 * An optional projected `<ng-template let-row let-rowIndex="rowIndex">`
 * replaces the default `row[field]` text rendering for that column (a
 * formatted currency value, a Tag/Badge, a row of action buttons, ...).
 *
 * **`editable` + a second named template (`#editTemplate`)**, for `DataTableComponent`'s
 * `editMode="cell"`). `contentChild(TemplateRef)` alone only ever resolves the *first* matching
 * `<ng-template>`, so telling the display template apart from the edit one needs a second,
 * explicitly-named query (`contentChild('editTemplate', { read: TemplateRef })`) rather than a
 * second bare `contentChild(TemplateRef)` — the consumer marks their own edit template with a
 * `#editTemplate` reference variable (`<ng-template #editTemplate let-row let-onSave="onSave"
 * let-onCancel="onCancel">`), the same plain Angular idiom this library otherwise doesn't need
 * since every other component so far has only ever needed one projected template per content-child
 * slot.
 *
 * **`frozen`/`alignFrozen`** keep a column in view while the table scrolls horizontally, in `DataTableComponent` and
 * `TreeTableComponent` alike. Deliberately **not** computed imperatively with pixel offsets (a `ResizeObserver`
 * plus a window `resize` listener would recompute them, the shape behind the known "doesn't
 * recompute when the layout changes" bug): each table derives every frozen column's `left`/`right` offset
 * declaratively from the column widths and applies plain CSS `position: sticky`, so the browser handles
 * stickiness natively with no JS recomputation loop.
 */
@Component({
  selector: 'med-table-column',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hidden' },
  template: ``,
})
export class TableColumnComponent {
  readonly field = input.required<string>();
  readonly header = input('');
  readonly sortable = input(false, { transform: booleanAttribute });
  readonly align = input<TableColumnAlign>('left');
  readonly width = input<string | null>(null);
  readonly editable = input(false, { transform: booleanAttribute });
  readonly frozen = input(false, { transform: booleanAttribute });
  readonly alignFrozen = input<'left' | 'right'>('left');
  /**
   * Shows or hides the column. While `false` the table renders no header, body or footer cell for it and leaves it out of
   * column spans, frozen offsets and CSV export; its sort state, filter matching and resized width are kept, so setting it
   * back to `true` restores the column as it was.
   */
  readonly visible = input(true, { transform: booleanAttribute });
  /**
   * Whether the user can move this column by dragging its header or with Alt+ArrowLeft/Right on the focused header.
   * Set it to `false` to pin the column's position; other columns cannot be dropped onto it either.
   */
  readonly reorderable = input(true, { transform: booleanAttribute });
  /** Adds a funnel button to the header that opens a filter menu for this column. */
  readonly columnFilter = input(false, { transform: booleanAttribute });
  /** Value type of the column's filter: decides the value control and the match modes offered. */
  readonly filterType = input<TableFilterType>('text');
  /** Match mode preselected in the filter menu when it is offered; defaults to the first mode of the type. */
  readonly filterMatchMode = input<TableFilterMatchMode | null>(null);
  /** Restricts the offered match modes to those listed here that belong to `filterType`. */
  readonly filterMatchModes = input<readonly TableFilterMatchMode[] | null>(null);

  readonly cellTemplate = contentChild(TemplateRef);
  readonly editTemplate = contentChild('editTemplate', { read: TemplateRef });
}
