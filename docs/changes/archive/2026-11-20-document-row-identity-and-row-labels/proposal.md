# Proposal: document-row-identity-and-row-labels

## Why

Developers building a `med-data-table` cannot learn from the docs or the spec that rows can be named for screen readers or given a stable identity, because `rowAriaLabel` and `rowTrackBy` have no example, no scenario and no test. Without `rowAriaLabel` every selection checkbox and radio is announced as "Select row", so a screen-reader user cannot tell the rows apart. Without `rowTrackBy` the table identifies rows by position, so a reordered or refreshed list re-renders every row and expanded rows stay attached to the position rather than to the record. Both inputs already work, so this change records and proves what exists. It is a follow-up to the DataTable parity series, outside the seven planned changes.

## What Changes

- A `med-data-table` with `rowAriaLabel` gives each row's selection checkbox or radio the label that the function returns for that row. Without it the label stays "Select row". This is now stated and tested.
- A `med-data-table` with `rowTrackBy` identifies rows by the value the function returns, and uses that value as the row expansion key when `dataKey` is not set. By default rows are identified by index. This is now stated and tested.
- The docs page gains two examples: row labels and row identity.

## Scope

### In scope

- New requirement DAT-027 for `rowAriaLabel` and `rowTrackBy`, with scenarios, and tests that cite every scenario.
- Docs examples `row-aria-label` and `row-track-by`, with demos, prose files and code blocks.
- DAT-024 extended with the two examples and one scenario.

### Out of scope

- Changing the component: both inputs work today, and a defect found by the new tests would need its own proposal.
- `dataKey` and `rowClass`: they are already covered by DAT-006, DAT-010 and DAT-024.
- `med-tree-table` and `med-data-view`: they have their own row code and are not part of the DataTable docs page.
- A changeset: no code or API of `@medra.dev/ui` changes.

## Track

**Track:** fast
**Rationale:** No full-track criterion fired. One capability is touched and none is created. No public interface, data shape or dependency changes, because the inputs already exist. About five tasks are expected, and no active learning asks for a plan on this capability.
**Security:** not-relevant
**Security rationale:** None fired. The change adds tests and documentation for two existing inputs, with no new input surface, data, permission, secret or dependency.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-024, DAT-027 |

## Impact

- **Code:** `projects/medra/ui/src/lib/data-table/data-table.component.spec.ts`, the docs page and two new demos in `projects/site`, and `e2e/site/data-table-docs.spec.ts`.
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
