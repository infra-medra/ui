---
'@medra.dev/ui': minor
---

DataTable: extend `stateKey` persisted state to save and restore `columnOrder`, `columnWidths`, `columnVisibility`, `collapsedRowGroups`, `globalFilter`, `multiSortMeta`, and the paginator page size (`rows`). Each stored field is validated and restored independently on init (skipping malformed entries, unknown column fields, out-of-range widths, or page sizes outside `rowsPerPageOptions`) without emitting user-action events, and a restored `globalFilter` applies immediately without waiting for `filterDelay`. Add the `visibleChange` output to `med-table-column` to support `[(visible)]` two-way binding so restored column visibility reaches the application while subsequent `visible` input updates still override it.
