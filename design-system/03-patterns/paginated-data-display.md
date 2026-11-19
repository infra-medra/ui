# Pattern: Paginated data display

## Components involved

`DataTable` and `DataView` (`02-components/data-display/`) both embed `Paginator` (`02-components/navigation/paginator.md`) directly as an internal implementation detail — not something the consumer wires up separately.

## The pattern

`DataTableComponent` renders `<med-paginator>` itself, conditionally, when its own `paginator` input is `true` and there's at least one row (`lib/data-table/data-table.component.ts:180-181,189`):

```html
<med-paginator class="mt-3 block" [totalRecords]="sortedValue().length" [rows]="rows()" [(first)]="first" />
```

`first` (the current page's starting row index) is a two-way binding owned by DataTable itself, not exposed for the consumer to drive independently — pagination state lives inside the table, not beside it.

## Why this matters for consistency

Any new tabular/collection component needing pagination should embed `Paginator` the same way (as an internal implementation detail bound to `totalRecords`/`rows`/`[(first)]`) rather than asking the consumer to place a separate `<med-paginator>` next to the data component and wire slicing logic themselves. This keeps "how many rows are shown" and "which page am I on" as one component's concern, matching what DataTable/DataView already do.

## Source

`projects/medra/ui/src/lib/data-table/data-table.component.ts:5,80,180-181,189,235`; `projects/medra/ui/src/lib/data-view/data-view.component.ts`; `projects/medra/ui/src/lib/paginator/`.
