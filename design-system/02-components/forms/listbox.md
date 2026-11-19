## Component: Listbox

### Description
`ListboxComponent` (`med-listbox`) is an always-visible, bordered-box selection list — the same option-list content used by Select/MultiSelect (`SelectPanelComponent`), but rendered inline instead of inside a connected overlay. It implements `ControlValueAccessor`, so it's usable directly with `ngModel`/reactive forms, and supports both single and multiple selection. Use it when a list of options should always be visible on the page (no click-to-open trigger needed) — e.g. a persistent filter panel — rather than a compact dropdown.

Per the component's own doc comment (`projects/medra/ui/src/lib/listbox/listbox.component.ts:9-33`), it deliberately reuses `SelectPanelComponent` unmodified rather than duplicating keyboard nav/virtualized rows/filtering logic.

### Variants
| Variant | When to use |
|---|---|
| Single selection (`multiple=false`, default) | Pick exactly one option |
| Multiple selection (`multiple=true`) | Pick any number of options (checkbox indicators) |
| Filterable (`filter=true`) | Adds a search input above the option list for long lists |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `options` | `readonly SelectOption<T>[]` | `[]` | List of `{ label, value, disabled? }` items — `projects/medra/ui/src/lib/listbox/listbox.component.ts:64`, shape from `projects/medra/ui/src/lib/select/select.types.ts:2-6` |
| `multiple` | `boolean` | `false` | Enables multi-select with checkbox indicators — `listbox.component.ts:65` |
| `filter` | `boolean` | `false` | Shows a search/filter input inside the panel — `listbox.component.ts:66` |
| `disabled` | `boolean` | `false` | Disables the control at the value layer (see Accessibility note below) — `listbox.component.ts:67` |
| `invalid` | `boolean` | `false` | Applies the danger border — `listbox.component.ts:68` |
| `filterPlaceholder` | `string` | `'Search'` | Placeholder text for the filter input — `listbox.component.ts:70` |
| `emptyLabel` | `string` | `'No results found'` | Text shown when there are no options/matches — `listbox.component.ts:71` |
| `class` | `string` | `''` | Extra classes merged onto the wrapper — `listbox.component.ts:72` |

No `size` input exists — Listbox has no `sm`/`default`/`lg` variant (see Issues below).

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Bordered box, `border-surface-300` (`dark:border-surface-600`) | — |
| Hover | Handled per-row inside `SelectPanelComponent` (`selectOptionVariants`, `active` state on hover/keyboard nav) | |
| Focus | `SelectPanelComponent` self-focuses on init; active row tracked via `aria-activedescendant`, not real per-row DOM focus | |
| Active/Selected | Selected row highlighted (`bg-brand-50`/checked checkbox indicator) | |
| Disabled | `pointer-events-none opacity-(--opacity-disabled)` on the wrapper — `listbox.component.ts:90` | Rejects `optionToggled`, but does **not** retract DOM focusability (documented gap, see class doc `listbox.component.ts:24-32`) |
| Loading | Not implemented | |
| Error | `border-danger-500` (`dark:border-danger-400`) when `invalid=true` — `listbox.component.ts:89` | |

### Accessibility
- **Role/ARIA:** Delegated entirely to `SelectPanelComponent`: `role="listbox"` on the option container, `role="option"` per row, `aria-multiselectable` when `multiple`, `aria-selected`/`aria-disabled` per option (`projects/medra/ui/src/lib/select/select-panel.component.ts:66-82`). `ListboxComponent`'s own wrapper `<div>` carries no ARIA attributes of its own. Confirmed by spec: `listbox.component.spec.ts — 'sets aria-multiselectable'` asserts `[role="listbox"]` carries `aria-multiselectable="true"` in multiple mode.
- **Keyboard navigation:** `ArrowDown` moves the active-descendant to the next *enabled* option, transparently skipping disabled ones, and `Enter` commits the selection — verified by `listbox.component.spec.ts:40-50 — 'ArrowDown then Enter selects the next enabled option, skipping the disabled one'`. In multiple mode, `Enter` toggles an option on/off repeatedly (`listbox.component.spec.ts:138-150 — 'toggling an option via keyboard adds it, toggling again removes it'`). This is inherited from `SelectPanelComponent`, not reimplemented in `ListboxComponent` itself. **Disabled-item focusability and filter-mode keyboard — resolved 2026-08-19:** both already worked correctly via the shared `SelectPanelComponent` (`enabledIndexes()`/`firstEnabledIndex()`/`lastEnabledIndex()` in `select-panel.component.ts:233-246` already exclude disabled options from Home/End/Arrow navigation, not just from being *selected*), they just had no Listbox-level assertion. Now confirmed by `listbox.component.spec.ts` — `'a disabled option is never the active descendant, even at the boundary a Home/End jump would otherwise land on'` (both list edges disabled; Home then End then Enter still resolves only the enabled middle option) and, under `describe('filter mode', ...)`, `'renders a filter box when filter is true'` / `'typing in the filter box narrows the options, and Arrow/Enter selects a filtered result'`.
- **Screen reader:** `aria-activedescendant` tracks the virtually-active row (from `SelectPanelComponent`). No `aria-label` on the Listbox wrapper itself — a consumer must label it externally (e.g. a preceding `<label>`).
- **Disabled state:** `disabled=true` reliably blocks value changes even when a keyboard event reaches the listbox — `listbox.component.spec.ts:87-97 — 'disabled: rejects option toggles even if a keyboard event slips through'` and the CVA path `listbox.component.spec.ts:112-121 — 'disables via setDisabledState (Reactive Forms disable())'`. However no test asserts `tabindex`/focusability is actually removed from the DOM when disabled — the component doc comment itself documents this as a known gap (`listbox.component.ts:24-32`), and it remains **untested**, i.e. a disabled Listbox may still be keyboard-focusable even though it rejects input. (This is a different axis from "disabled *option* focusability" above, which is resolved — this one is about the whole disabled *control* never losing DOM focusability, still an accepted gap.)
- Since Listbox is always inline (never an overlay), there is no open/close, outside-click-dismiss, or focus-return behavior to verify — `listbox.component.spec.ts:34-38 — 'renders the shared SelectPanelComponent listbox inline (no overlay)'` explicitly asserts no `.cdk-overlay-container [role="listbox"]` exists.
- **A11y verdict:** Covered — **resolved 2026-08-19**: core roving-selection keyboard behavior (arrow-skip-disabled, Enter select/toggle, `aria-multiselectable`), disabled-*option* exclusion from Home/End/Arrow navigation, and filter-mode keyboard interaction (type-to-narrow, then Enter on a filtered result) are all now directly spec-verified at the Listbox level. The one remaining, unchanged gap is the disabled-*control*-level focusability question above (rejects input, but DOM focusability isn't retracted) — a documented, deliberate scope cut, not a regression.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use for a persistent, always-visible option list (filter panels, sidebars) | Don't expect a compact dropdown trigger — use `med-select`/`med-multi-select` for that |
| Pair with a real `<label>` since the wrapper has no `aria-label` input | Don't rely on `disabled` to remove keyboard focusability — it only blocks pointer interaction and value changes (documented gap, and untested either way — see Accessibility) |
| Trust `ArrowDown`/`Home`/`End`/`Enter` to skip disabled options automatically, and filter-mode typing + Arrow/Enter to work, at the Listbox level (both spec-verified — **resolved 2026-08-19**) | Don't rely on `disabled` to remove keyboard focusability from the *control itself* — it only blocks pointer interaction and value changes (documented gap, and untested either way — see Accessibility) |

### Code example (Angular)
```html
<med-listbox [options]="fruitOptions" class="w-48" [(ngModel)]="listboxDemoValue" name="demo-listbox" />

<med-listbox [options]="fruitOptions" multiple filter class="w-48" [(ngModel)]="listboxMultipleDemoValue" name="demo-listbox-multi" />
```
Source: `projects/showcase/src/app/app.html:303-313`

### Source
- `projects/medra/ui/src/lib/listbox/listbox.component.ts`
- `projects/medra/ui/src/lib/select/select-panel.component.ts` (shared panel content)
- `projects/medra/ui/src/lib/select/select.types.ts`
