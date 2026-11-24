# Threat Model: persist-data-table-extended-state

**Author:** security agent · 2026-11-23
**Stack:** Angular 21.2.25 (`@angular/core`, root `package.json` and `package-lock.json`) · TypeScript ~5.9.2 · `@medra.dev/ui` 21.0.1 (peer `@angular/core` ^21.2.0) · browser Web Storage (`sessionStorage` / `localStorage`)

## Scope

- **In:** the restore path (`restoreTableState` and the planned `parseStoredTableState` in `data-table-state.ts`) for all twelve keys of `contracts/stored-table-state.md`, including the five existing keys the contract tightens. Also the persist effect (`persistTableState`), which now writes the seven new keys, and the restored visibility override with its `visibleChange` output on `med-table-column` (D-02). Assumption: the table runs in the browser only (`isPlatformBrowser`), and any script on the same origin can read and write the `stateKey` entry.
- **Out:** how the application handles the sort and filter values that reach it through `onLazyLoad` and the two-way models. A user can type the same values, so validating them on the server is the application's job, and this change does not alter it. Also out: XSS in the host application, since it already gives full control of the origin and storage adds nothing to that; the tree table, which has no persisted state (proposal Out of scope); and selection, edits and scroll position, which are not persisted.

## Assets

- Table state integrity and availability: `internal`. If a stored value breaks the table, the table fails on every load until the storage entry is cleared.
- Stored search and filter content (`globalFilter`, `columnFilters` values, `collapsedRowGroups` group values): `confidential` when the application shows personal or business data. These are what the user searched for, and group values are copied from row data.
- Column visibility chosen by the application (`visible` on `med-table-column`): `internal`. Some applications use it to hide a column from some users, even though the row data is already in the client.

## Trust Boundaries

| ID | Boundary | From → To |
|---|---|---|
| B-01 | Stored state restore | Web Storage entry under `stateKey` (writable by any same-origin script, an older library version, the user through devtools, or an earlier user of the same browser profile) → table signals and models |
| B-02 | Stored state persist | Table state → Web Storage entry (readable by any same-origin script and, with `local`, by later users of the same browser profile, with no expiry) |

## Entry Points

- `restoreTableState(stateKey)` → `storage.getItem(stateKey)` → `JSON.parse` → per-key parsers (B-01): accepts any text. Runs once per `stateKey` after the browser is ready, with no user action.
- `TableColumnComponent` effective visibility set on restore, emitting `visibleChange` to the application's `[(visible)]` binding (B-01). The value comes from `columnVisibility`.
- Persist effect → `persistTableState` → `storage.setItem(stateKey, JSON.stringify(state))` (B-02). Runs on every change to a persisted field.

## Threats

| ID | STRIDE | Threat | Boundary | Severity | Likelihood | Mitigations |
|---|---|---|---|---|---|---|
| TM-01 | T, D | A stored value of the wrong type or range reaches a table signal and throws during compute or render, so the table breaks on every load until storage is cleared. Examples: `columnOrder` that is not an array, a `multiSortMeta` item that is `null`, a negative or fractional `first`, or an arbitrary `sortOrder` string; the current code accepts the last two. | B-01 | medium | medium | M-01 |
| TM-02 | T | A stored record is read through the prototype chain, or kept as a plain object, so an inherited member is treated as stored data. Example: the current `expandedRowKeys` is set to the parsed object as is, so `expandedRowKeys()['constructor']` is truthy and a row whose key is `constructor` shows as expanded. Keys like `__proto__` or `constructor` in `columnWidths`, `columnVisibility` or `columnFilters` are the same risk. | B-01 | low | low | M-02 |
| TM-03 | D | Values with the right type but extreme size make the table unusable on every load. Examples: a width of `1e308` px, a `collapsedRowGroups` array of hundreds of thousands of strings that is scanned with `includes` for every row, or a multi-megabyte `globalFilter`. | B-01 | low | low | M-03 |
| TM-04 | I | The persisted object now holds the committed search text and collapsed group values taken from row data, next to the existing filter values. With `stateStorage="local"` they stay after sign-out with no expiry, and any same-origin script or the next user of a shared browser profile can read them. | B-02 | medium | medium | M-04 |
| TM-05 | I, E | A stored `columnVisibility` entry of `true`, written by an earlier user of the same browser profile or edited by hand, overrides an application's declared `visible=false` on restore (DAT-056.S7). A column the application hides by role then shows the row data it holds. | B-01 | medium | low | M-04, M-05 |
| TM-06 | T | Restored strings (`globalFilter`, `collapsedRowGroups`, `columnOrder` fields) reach a DOM sink that parses HTML, such as `innerHTML` or a value passed through `bypassSecurityTrust*`, instead of an escaped binding. | B-01 | info | low | M-06 |

## Mitigations

<!-- The security agent writes `pending`; the author replaces it with `accepted (D-NN)` or `declined (D-NN)` before the plan gate. -->

| ID | Mitigation | Threats | Decision |
|---|---|---|---|
| M-01 | In `data-table-state.ts`, give every key, including the five existing ones, an allowlist parser per the contract: `first` a non-negative safe integer, `sortOrder` one of `'asc'`, `'desc'` or `null`, `expandedRowKeys` a non-array object, and every column-bound key checked against the declared fields. Each parser runs in its own guard, so one key that fails or throws drops only that key. A Jest case per key feeds `null`, an array, a number, a string and a nested object. | TM-01 | accepted (D-06) |
| M-02 | Read stored records only for declared fields, and only when `Object.hasOwn(record, field)` is true. Build restored data as a `Map` (widths) or an `Object.create(null)` record from declared fields or validated `true` entries (`expandedRowKeys`, visibility, filters). Never assign, spread or `Object.assign` a parsed stored object into table state. A Jest case stores `__proto__`, `constructor` and `toString` keys and asserts none is restored. | TM-02 | accepted (D-06) |
| M-03 | Add upper bounds to the parsers. A width is restored only up to a fixed maximum in pixels. `collapsedRowGroups` is de-duplicated and capped in item count. `globalFilter` is capped in length. `first` must be a safe integer. Restored group keys are checked through a `Set`. | TM-03 | accepted (D-08) |
| M-04 | Keep `session` as the `stateStorage` default. In the TSDoc of `stateKey` and `stateStorage`, and in the persisted-state docs prose (DAT-024.S18), list every stored field, including search text, filter values and group values. Say that `local` keeps them with no expiry, and advise applications that show sensitive data to use `session`, include the signed-in user's identity in `stateKey`, and remove the key on sign-out. | TM-04, TM-05 | accepted (D-09) |
| M-05 | In the TSDoc of `visible` and in the column toggle docs, state that `visible` and its restored value are presentation only, not access control. A column a user must not see has to be left out of the template and its data left out of `value`, rather than declared `visible="false"`. | TM-05 | accepted (D-09) |
| M-06 | Bind every restored string only through property bindings or interpolation (the existing `[value]="filterInputText()"`). Add no `innerHTML` or `bypassSecurityTrust*` call on the restore path; the verify audit checks this. | TM-06 | accepted (D-06) |

## Residual Risks

- TM-04: M-04 is guidance only. The library cannot tell whether the search text or group values are sensitive, or when a user signs out, so the stored content stays readable on a shared profile until the application scopes or removes the key. A library-level clear API or a store-nothing-sensitive option would reduce this. Both are out of the proposal's scope (no storage adapter).
- TM-05: M-04 and M-05 only reduce this risk. DAT-056.S7 requires a stored `true` to override a declared `visible=false`, so an application that uses `visible` as a role gate still shows the column to whoever inherits the stored entry. Only keeping unauthorized data out of `value` closes this, and that is up to the application.
- All B-01 threats: any script on the same origin can always rewrite the entry. The parsers keep a tampered entry within the contract, but cannot stop a valid yet unwanted state, for example a hidden column or a different sort.

## Sources

- https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html: data in local storage is not to be trusted, sensitive information should not be stored there, and sessionStorage is preferred when persistence is not needed. Supports TM-01, TM-04 and M-04.
- https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html: allowlist validation, expected type with minimum and maximum values, length limits for strings, item counts for arrays, and validating stored records that cross a trust boundary. Supports M-01 and M-03.
- https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html: use `Map`/`Set` or `Object.create(null)` instead of object literals. Supports M-02.
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn: `Object.hasOwn` ignores inherited properties and works on null-prototype objects. Supports M-02.
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage: `localStorage` data has no expiration time, while `sessionStorage` is cleared when the page session ends. Supports TM-04 and M-04.
- https://angular.dev/best-practices/security: Angular treats values as untrusted and escapes and sanitizes template bindings; avoid `bypassSecurityTrust*`. Supports M-06.
