# Proposal: extend-data-table-keyboard-navigation-to-multiple-selection

## Why

Keyboard users of a `med-data-table` with `selectionMode="multiple"` can only reach a row through its checkbox, so they Tab through every checkbox to move down the table, while single and radio tables already offer arrow-key movement between rows. The row itself cannot take focus in this mode and pressing Space or Enter on it does nothing, so the table behaves differently by selection mode for no reason a user can see. This extends the row keyboard navigation added by DAT-026 to `multiple`.

## What Changes

- In `multiple` selection mode, each body row can take focus, as it already can in `single` and `radio`.
- In `multiple` mode, ArrowDown, ArrowUp, Home and End on a focused row move focus between the rows of the current page, without changing the selection and without wrapping.
- In `multiple` mode, Space and Enter on a focused row toggle that row in the selection.
- The keyboard navigation docs example shows the multiple mode.

## Scope

### In scope

- The `multiple` branch of the row key handling and row focusability in `med-data-table`.
- DAT-026 rewritten to cover `single`, `radio` and `multiple`, with its scenarios.
- The keyboard navigation docs example and its prose, plus a changeset.

### Out of scope

- Shift+Arrow range selection and Ctrl+A select-all: they need an anchor row and rules for pages and filters, and were not requested.
- `med-tree-table` and `med-data-view`: they have their own selection code and are not part of this request.
- Tables without a selection mode: rows stay unfocusable and the keys stay unhandled, so existing tab order is unchanged.

## Track

**Track:** fast
**Rationale:** No criterion fired. It touches one capability (`data-display`), creates no capability, changes no stored data, adds no public API or dependency, and needs about four tasks.
**Security:** not-relevant
**Security rationale:** None fired. The change adds keyboard handlers to an existing component, with no input, data, permission, secret or dependency change.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-026 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/data-table.component.ts` and its spec, the keyboard navigation docs example in `projects/site`, and the e2e specs that cite DAT-026.
- **Interfaces:** None. Row focusability and key handling change in `multiple` mode, but no input, output or type changes.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
