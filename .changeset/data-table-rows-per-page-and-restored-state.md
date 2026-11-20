---
'@medra.dev/ui': patch
---

DataTable: picking a different "rows per page" now changes the visible rows and the `lazyLoad` `rows` value, and a table that restores its `stateKey` state after a reload no longer shows two current pages in the paginator.
