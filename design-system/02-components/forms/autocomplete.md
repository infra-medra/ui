## Component: Autocomplete

### Description
`AutocompleteComponent` (`med-autocomplete`) is an editable combobox implementing the WAI-ARIA APG "Editable Combobox With List Autocomplete" pattern (`projects/medra/ui/src/lib/autocomplete/autocomplete.component.ts:42-50`). Unlike Select, `role="combobox"` lives directly on the real `<input>` (free-text typing), and DOM focus never leaves that input while the suggestion panel is open — arrow keys/Enter/Escape are handled on the input itself, not delegated to the panel. Suggestions are consumer-driven (not filtered locally): typing emits `(search)` (debounced by `searchDelay`) and the consumer sets `[suggestions]` in response, supporting both local filtering and server-side search. Implements `ControlValueAccessor` with value type `SelectOption<T> | null`.

**Scope reduced for v1**: picking a suggestion is the only way to produce a value — no `forceSelection`/"commit free text" or "revert to last selection on blur" (`autocomplete.component.ts:72-76`).

### Variants
| Variant | When to use |
|---|---|
| `size="sm" \| "default" \| "lg"` | Shared field-size scale (reuses `InputTextSize`) |
| `showClear` | Adds a clear (×) button when a suggestion is selected |
| `loading` | Shows a spinner in place of the clear button while the consumer's search is in flight |
| `invalid` | Error state |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `suggestions` | `readonly SelectOption<T>[]` | `[]` | Consumer-supplied match list — `autocomplete.component.ts:133` |
| `size` | `InputTextSize` | `'default'` | `autocomplete.component.ts:134` |
| `invalid` | `boolean` | `false` | `autocomplete.component.ts:135` |
| `disabled` | `boolean` | `false` | `autocomplete.component.ts:136` |
| `loading` | `boolean` | `false` | `autocomplete.component.ts:137` |
| `showClear` | `boolean` | `false` | `autocomplete.component.ts:138` |
| `minLength` | `number` | `1` | Minimum typed length before a search is dispatched — `autocomplete.component.ts:139` |
| `searchDelay` | `number` | `300` (ms) | Debounce before `(search)` fires — `autocomplete.component.ts:140` |
| `placeholder` | `string` | `'Search'` | `autocomplete.component.ts:142` |
| `emptyLabel` | `string` | `'No results found'` | `autocomplete.component.ts:143` |
| `clearLabel` | `string` | `'Clear'` | aria-label for the clear button — `autocomplete.component.ts:144` |
| `inputId` | `string \| null` | `null` | `autocomplete.component.ts:145` |
| `class` | `string` | `''` | `autocomplete.component.ts:146` |
| `search` (output) | `EventEmitter<string>` | — | Emitted once the debounced query reaches `minLength` — `autocomplete.component.ts:148` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | `inputTextVariants` default field styling | — |
| Hover | Shared `inputTextVariants` hover border | |
| Focus | Field focus ring; `aria-expanded`/`aria-controls`/`aria-activedescendant` update as the panel opens/nav happens (`autocomplete.component.ts:99-101`) | ArrowDown opens or moves highlight; ArrowUp moves highlight; Enter selects active suggestion; Escape closes (`autocomplete.component.ts:230-258`) |
| Active | Highlighted row inside the panel (`selectOptionVariants` `active`) | |
| Disabled | `[disabled]` on the native input (real `:disabled` pseudo-class, unlike Select's `div`) | Keydown handler no-ops (`autocomplete.component.ts:231-233`) |
| Loading | `<med-progress-spinner size="sm">` replaces the clear button (`autocomplete.component.ts:113-114`) | Panel deliberately does **not** open with a "searching" placeholder — opens only once results settle (`autocomplete.component.ts:57-62`) |
| Error | `aria-invalid="true"`, danger border/ring (`inputTextVariants`) — `autocomplete.component.ts:102` | |
| Open/Closed | `aria-expanded` reflects `isOpen()` | Overlay opened via `OverlayService.openConnected`, panel width synced to trigger width (`autocomplete.component.ts:317`) |

### Accessibility
- **Role/ARIA:** Input: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-invalid` (`autocomplete.component.ts:95-102`). Panel: `role="listbox"` container, `role="option"` per row with `aria-selected`/`aria-disabled` (`projects/medra/ui/src/lib/autocomplete/autocomplete-panel.component.ts:41-51`). Both roles and the per-row `aria-selected`/`aria-disabled`/id wiring are directly spec-verified in `autocomplete-panel.component.spec.ts — 'renders one row per option with the right id'`, `'reflects selectedValue via aria-selected'`, and `'marks a disabled option with aria-disabled'`.
- **Keyboard navigation:** ArrowDown/ArrowUp move `aria-activedescendant` between suggestions and **wrap around while transparently skipping disabled options** — spec-verified in `autocomplete.component.spec.ts:163-183 — 'selecting a suggestion by keyboard (ArrowDown + Enter) works the same way, and skips disabled options'` (ArrowDown from Apple wraps past disabled Cherry back to Apple; ArrowUp from Apple wraps forward to the last enabled option, Banana). Enter commits the active suggestion; Escape closes the panel **without** altering the committed value — `autocomplete.component.spec.ts:185-199 — 'Escape closes the panel without changing the value'`. All of this is handled directly on the input (`autocomplete.component.ts:230-258`); the panel itself never calls `.focus()` and owns no keydown handling (`autocomplete-panel.component.ts:11-16`), which the spec's design confirms indirectly — every keyboard interaction dispatches on the trigger input, never on the panel.
- **Screen reader:** `aria-activedescendant` points assistive tech at the "virtually active" row while real focus stays on the input — confirmed by `autocomplete.component.spec.ts:173 — expect(...).toMatch(/-option-0$/)`. Clear button has its own `aria-label` (`clearLabel`), and its presence is gated correctly on having a value: `autocomplete.component.spec.ts:265-271 — 'is not shown when nothing is selected'`.
- **Editing after selection:** typing after a suggestion has been committed clears the value back to `null` (rather than silently keeping a stale selection) — `autocomplete.component.spec.ts:201-216 — 'editing the text after a selection clears the committed value'`.
- **Disabled:** a disabled input both carries the native `disabled` attribute and ignores `ArrowDown`, never opening the panel — `autocomplete.component.spec.ts:274-284 — 'a disabled Autocomplete ignores typing and never opens'`.
- **Overlay teardown:** destroying the host while the panel is open removes the overlay rather than leaking it — `autocomplete.component.spec.ts:294-304 — 'destroying the component while the panel is open closes the overlay'`.
- **Coverage gap — outside-click dismissal:** no test in either spec file simulates a click outside the trigger/panel; outside-click dismissal is `[not covered by tests]` (only Escape and picking a suggestion are exercised as close paths). Since this pattern intentionally keeps real DOM focus on the input at all times (never moving into the panel), there is no separate "focus return to trigger" concern the way there is for combobox-with-listbox-focus patterns — but that focus-never-leaves-input property itself is not asserted via `document.activeElement` in any test, only implied by the fact every test dispatches keyboard events on the trigger.
- **A11y verdict:** Covered — role/ARIA wiring, disabled-skip-on-arrow-nav-with-wraparound, Enter-to-select, Escape-to-close-without-mutating-value, and disabled-blocks-open are all directly spec-verified across both spec files; the only real gap is the absence of an explicit outside-click-dismissal test.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Set `[suggestions]` in response to `(search)` — the component never filters locally | Don't expect free text to become the value on blur — only picking a suggestion commits a value (no `forceSelection`) |
| Use `loading` to show the fetch-in-progress spinner instead of opening the panel early | Don't rely on the panel showing a "searching…" placeholder — it only opens once results have settled |
| Trust ArrowDown/ArrowUp to wrap around and skip disabled suggestions automatically (spec-verified) | Don't assume outside-click dismissal is regression-tested — only Escape and picking a suggestion are covered as close paths |
| Rely on Escape leaving the current value untouched (spec-verified) | Don't type over a committed selection expecting the old value to survive — any edit after selection resets the value to `null` |

### Code example (Angular)
```html
<med-autocomplete
  [suggestions]="autocompleteSuggestions"
  [loading]="autocompleteLoading()"
  placeholder="Search a fruit (simulated 400ms server delay)"
  showClear
  class="w-full sm:w-auto sm:min-w-[20rem]"
  [(ngModel)]="autocompleteDemoValue"
  name="demo-autocomplete"
  (search)="onFruitSearch($event)"
/>
```
Source: `projects/showcase/src/app/app.html:427-436`

### Source
- `projects/medra/ui/src/lib/autocomplete/autocomplete.component.ts`
- `projects/medra/ui/src/lib/autocomplete/autocomplete-panel.component.ts`
- `projects/medra/ui/src/lib/input-text/input-text.styles.ts` (shared `inputTextVariants`)
- `projects/medra/ui/src/lib/select/select.styles.ts` (shared `selectOptionVariants`, `SELECT_PANEL_CLASS`)
