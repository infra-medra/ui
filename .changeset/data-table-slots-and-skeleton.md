---
'@medra.dev/ui': minor
---

DataTable: add `#caption` and `#summary` template slots inside the bordered table container outside the scroll viewport (above the header and below the table before any paginator), add an optional `#empty` template rendered inside the spanning empty-state cell instead of `emptyLabel` when zero visible rows are shown and `loading` is false, and add the `loadingMode` input (`'spinner' | 'skeleton'`, typed via `TableLoadingMode`, default `'spinner'`) to render `SkeletonComponent` placeholder cells across all visible columns while loading.
