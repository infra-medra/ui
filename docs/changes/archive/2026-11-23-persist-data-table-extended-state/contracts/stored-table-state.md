# Contract: stored table state

The JSON object `med-data-table` writes under `stateKey` in `sessionStorage` or `localStorage`. Every key is optional when read; the table writes all of them.

| Key | Written as | Accepted on restore (otherwise the key is skipped) | Since |
|---|---|---|---|
| `first` | page offset, number | a non-negative integer | existing |
| `sortField` | `string \| null` | `null`, or the `field` of a declared column; skipped together with `sortOrder` otherwise | existing (check new) |
| `sortOrder` | `'asc' \| 'desc' \| null` | one of those values | existing |
| `expandedRowKeys` | `Record<string, boolean>` | a non-array object | existing |
| `columnFilters` | `Record<field, { matchMode, value }>` | per entry, as today (`parseStoredColumnFilters`) | existing |
| `columnOrder` | `string[]`, the user's order (empty until the first move) | an array; non-string, duplicate and undeclared fields dropped | new |
| `columnWidths` | `Record<field, number>` (pixels) | a non-array object; per entry, a declared field with a positive finite number | new |
| `columnVisibility` | `Record<field, boolean>` for every declared column | a non-array object; per entry, a declared field with a boolean | new |
| `collapsedRowGroups` | `string[]` (`expandedRowGroups`) | an array of strings; other items dropped | new |
| `globalFilter` | committed `globalFilterValue`, string | a string | new |
| `multiSortMeta` | `{ field, order }[]` | an array; per entry, a declared field not seen earlier with `order` `asc` or `desc` | new |
| `rows` | page size in effect, number | a positive integer that, when `rowsPerPageOptions` is set, is one of the options | new |

Example written by a table after the user's changes:

```json
{
  "first": 0,
  "sortField": null,
  "sortOrder": null,
  "expandedRowKeys": {},
  "columnFilters": {},
  "columnOrder": ["price", "name", "team"],
  "columnWidths": { "name": 180 },
  "columnVisibility": { "name": true, "team": false, "price": true },
  "collapsedRowGroups": ["A"],
  "globalFilter": "ab",
  "multiSortMeta": [{ "field": "name", "order": "asc" }, { "field": "price", "order": "desc" }],
  "rows": 5
}
```

## `med-table-column` visibility interface

```ts
/** Unchanged signature: still an input with `booleanAttribute`, so `visible="false"` and `[visible]` keep working. */
readonly visible = input(true, { transform: booleanAttribute });
/** New: emits when the table changes the column's visibility from stored state, enabling `[(visible)]`. */
readonly visibleChange = output<boolean>();
```
