# Archive

| # | Date | Change | Capabilities | Requirements | Why |
|---|---|---|---|---|---|
| 1 | 2026-11-19 | automate-medra-ui-versioning-and-release | release-versioning | +REL-001 +REL-002 +REL-003 +REL-004 +REL-005 +REL-006 +REL-007 +REL-008 +REL-009 | Maintainers of `@medra/ui` have no automated way to version and publish it, and the package sits at `0.1.0` while it ... |
| 2 | 2026-11-20 | document-existing-data-table-features | data-display | +DAT-024 | People adopting `@medra.dev/ui` can read about only 5 of the DataTable features on its docs page, although the compon... |
| 3 | 2026-11-20 | extend-data-table-appearance-and-selection | data-display | +DAT-025 +DAT-026 ~DAT-006 ~DAT-024 | People building tables with `med-data-table` cannot change its density, draw grid lines, stripe rows, offer radio-but... |
| 4 | 2026-11-20 | extend-data-table-keyboard-navigation-to-multiple-selection | data-display | ~DAT-026 | Keyboard users of a `med-data-table` with `selectionMode="multiple"` can only reach a row through its checkbox, so th... |
| 5 | 2026-11-20 | extend-data-table-sorting-and-pagination | data-display | ~DAT-002 ~DAT-005 | People building a `med-data-table` cannot tell from the docs that a table can start sorted or that its page can be se... |
| 6 | 2026-11-20 | document-row-identity-and-row-labels | data-display | +DAT-027 ~DAT-024 | Developers building a `med-data-table` cannot learn from the docs or the spec that rows can be named for screen reade... |
| 7 | 2026-11-20 | add-data-table-frozen-columns-rows-and-scroll | data-display | +DAT-028 +DAT-029 +DAT-030 ~DAT-024 | People building wide or tall tables with `med-data-table` cannot keep a key column or a summary row in view while the... |
| 8 | 2026-11-20 | add-data-table-resize-modes-visibility-groups | data-display | +DAT-031 +DAT-032 +DAT-033 ~DAT-001 ~DAT-009 ~DAT-010 ~DAT-024 | People building tables with `med-data-table` cannot choose how a column resize affects the rest of the table, cannot ... |
| 9 | 2026-11-20 | add-data-table-column-reorder | data-display | +DAT-034 ~DAT-024 | People building tables with `med-data-table` cannot let their users rearrange columns: the order is fixed by the temp... |
| 10 | 2026-11-20 | add-data-table-row-editing-and-group-modes | data-display | +DAT-035 +DAT-036 +DAT-037 ~DAT-008 ~DAT-010 ~DAT-024 | People building tables with `med-data-table` can edit only one cell at a time, only by double-clicking it, and can gr... |
| 11 | 2026-11-21 | add-data-table-column-filters | data-display | +DAT-038 +DAT-039 ~DAT-004 ~DAT-007 ~DAT-009 ~DAT-010 ~DAT-024 | People building tables with `med-data-table` can search only across all columns at once, so they cannot narrow a tabl... |
| 12 | 2026-11-22 | add-data-table-slots-and-skeleton | data-display | +DAT-040 +DAT-041 +DAT-042 ~DAT-007 ~DAT-024 | Applications using `<med-data-table>` currently have no way to render a table-level caption bar, a bottom summary bar... |
| 13 | 2026-11-22 | add-data-table-cell-selection-and-context-menu | data-display | +DAT-043 +DAT-044 +DAT-045 ~DAT-024 | Applications using `<med-data-table>` currently can only select entire rows, apply conditional classes at the row lev... |
| 14 | 2026-11-23 | add-data-table-virtual-scroll | data-display | +DAT-046 +DAT-047 +DAT-048 ~DAT-007 ~DAT-024 | Applications that show thousands of rows in `<med-data-table>` must either page them or render one DOM row per item, ... |
| 15 | 2026-11-23 | add-data-table-pagination-options | data-display | +DAT-049 ~DAT-024 | Applications that paginate a `<med-data-table>` cannot place the paginator above the table, change its "Showing X-Y o... |
| 16 | 2026-11-23 | add-data-table-responsive-stack | data-display | +DAT-050 +DAT-051 +DAT-052 ~DAT-024 | Applications that show a `<med-data-table>` on phones and narrow panes can only let it scroll sideways, so a user mus... |
| 17 | 2026-11-23 | add-data-table-column-templates-and-custom-sort | data-display | +DAT-053 +DAT-054 +DAT-055 ~DAT-033 ~DAT-024 | Applications using `<med-data-table>` cannot put anything but plain text in a column header, cannot show a per-column... |
