# Proposal: document-existing-data-table-features

## Why

People adopting `@medra.dev/ui` can read about only 5 of the DataTable features on its docs page, although the component implements many more, while the PrimeNG page it replaces lists 66 topics. Missing examples make existing features undiscoverable and block the parity work that follows. This is change 1 of 7 that together bring the DataTable to PrimeNG parity; it documents only what the component already does.

## What Changes

- The DataTable docs page gains an `EXAMPLES` list and an "On this page" index covering every implemented feature, modelled on the AutoComplete page.
- Each feature gets a prose file, a live demo and a code block, with the existing six sections kept and the combined sort-and-edit section split in two.
- The full PrimeNG classification (documented, to implement, discarded, decided) is recorded in `classification.md`.

## Scope

### In scope

- The 18 documentation groups marked **D** in `classification.md`, each as an example on `data-table.page.ts` (prose `.txt`, `.demo.ts`, `.demo.html`, code block).
- A page-level spec test in the style of `autocomplete-docs.spec.ts`.
- The classification record, including the sequence of changes 2 to 7.

### Out of scope

- Any change to `projects/medra/ui/src/lib/data-table/` behavior or API; new features belong to changes 2 to 7 so each ships with its own tests and changeset.
- Discarded topics (Pass Through, Styled/Unstyled, Document, responsive stack); they do not apply or have no PrimeNG index topic.
- A changeset; REL-004 exempts documentation-site-only pull requests.
- Theme redesign and other components; unrelated to table parity.

## Track

**Track:** full
**Rationale:** Size fires: about 20 examples with three files each plus a page test exceed 8 tasks. Breadth, Interface, Data, Dependency, Security, Constitution and Learnings do not fire (one capability, no API change, no learning scoped to `data-display`).
**Security:** not-relevant
**Security rationale:** No criterion fires: static documentation demos with sample data, no input handling, secrets, infrastructure or dependency change.

## Capabilities

| Capability | Operation | Requirements |
|---|---|---|
| `data-display` | modified | DAT-024 |

## Impact

- **Code:** `projects/site/src/app/pages/docs/components/data-table.page.ts`, new demos under `.../demos/data-table-*`, new `.txt` files under `projects/site/src/content/docs/`, one new page spec.
- **Interfaces:** None.
- **Data:** None.
- **Dependencies:** None.

## Open Questions

None.
