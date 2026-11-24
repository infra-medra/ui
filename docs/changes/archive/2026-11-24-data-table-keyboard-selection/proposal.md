# Proposal: data-table-keyboard-selection

## Why

Users working with `<med-data-table>` in keyboard-heavy or spreadsheet-like workflows cannot select row or cell ranges with `Shift+Arrow`, select all with `Ctrl+A`, drag-select rectangular cell ranges with the mouse, or navigate rows with arrow keys in read-only tables without a `selectionMode`. Adding these standard table interactions brings `<med-data-table>` keyboard and pointer ergonomics in line with desktop grid expectations.

## What Changes

- Support `Shift+ArrowDown`, `Shift+ArrowUp`, `Shift+Home`, and `Shift+End` range selection and `Ctrl+A` / `Meta+A` select-all in `selectionMode="multiple"` for both row selection and `cellSelection`.
- Support arrow-key cell navigation (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Home`, `End`) when `cellSelection` is active.
- Support mouse-drag rectangular cell selection (`mousedown` + hover + `mouseup`) when `cellSelection` is active in `selectionMode="multiple"`.
- Add an opt-in `keyboardNavigation` boolean input on `<med-data-table>` so tables without a `selectionMode` can enable focusable rows and arrow-key focus movement without changing default behavior for existing tables.

## Scope

### In scope

- Row keyboard range selection (`Shift+Arrow*`, `Shift+Home`, `Shift+End`) and `Ctrl+A` / `Meta+A` in `selectionMode="multiple"`.
- Cell keyboard navigation (`Arrow*`, `Home`, `End`), `Shift+Arrow*` rectangular range selection, `Ctrl+A` / `Meta+A` select-all, and mouse-drag rectangular cell selection in `cellSelection` mode.
- Opt-in `keyboardNavigation` input for arrow-key row focus navigation when `selectionMode` is unset.
- Unit/component tests in a dedicated spec file and updates to `DataTableComponent`.

### Out of scope

- Advanced column filters (`AND`/`OR`, `between`, `in`, filter row, `#filter` template) — will be proposed in a separate change.
- Virtual scroll extensions, CSV footer export, frozen column boundary moves, and responsive stack container breakpoints — separate changes.

## Track

**Track:** fast
**Rationale:** Additive behavior within a single existing capability (`data-display`), with opt-in `keyboardNavigation` preserving existing defaults and no architectural or breaking changes.
**Security:** not-relevant
**Security rationale:** Purely client-side keyboard and pointer selection logic operating on already-bound in-memory row data; no external input parsing, storage, authentication, or new dependencies.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-026, DAT-043 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/data-table.component.ts`, new spec file `projects/medra/ui/src/lib/data-table/data-table-keyboard-selection.spec.ts`.
- **Interfaces:** New `keyboardNavigation` boolean input on `DataTableComponent`.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
