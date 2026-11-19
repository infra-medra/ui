## Component: TreeSelect

### Description
`TreeSelectComponent` (`med-tree-select`) is a `Select`-style combobox trigger that opens an overlay containing a full `TreeComponent` for hierarchical picking. It reuses `selectTriggerVariants`/`SelectSize` unchanged from Select (`projects/medra/ui/src/lib/tree-select/tree-select.component.ts:5,89`), so its trigger looks and sizes identically to a plain Select. Use it when the option set is hierarchical (categories/sub-categories, org charts, file trees) rather than a flat list. Implements `ControlValueAccessor`.

**Single selection only for v1** — no `multiple`/checkbox picking (documented scope cut, same as CascadeSelect) — `tree-select.component.ts:24-28`.

### Variants
| Variant | When to use |
|---|---|
| `size="sm" \| "default" \| "lg"` | Matches Select's field-size scale |
| `invalid` | Error state (danger border/ring) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `options` | `readonly TreeNode[]` | `[]` | Hierarchical node list, `{ label, icon?, children?, expanded?, selectable? }` — `tree-select.component.ts:70`, shape from `projects/medra/ui/src/lib/tree/tree.types.ts:1-9` |
| `size` | `SelectSize` (`'sm' \| 'default' \| 'lg'`) | `'default'` | `tree-select.component.ts:71` |
| `invalid` | `boolean` | `false` | `tree-select.component.ts:72` |
| `disabled` | `boolean` | `false` | `tree-select.component.ts:73` |
| `placeholder` | `string` | `'Select an item'` | `tree-select.component.ts:74` |
| `class` | `string` | `''` | `tree-select.component.ts:75` |

Value (via `ControlValueAccessor`) is a single `TreeNode | null` — no `multiple` output shape exists.

### States
| State | Visual | Behavior |
|---|---|---|
| Default | `selectTriggerVariants` default — bordered `div[role=combobox]` | — |
| Hover | `hover:border-surface-400` (from shared `selectTriggerVariants`) | |
| Focus | `focus-visible:ring-(--focus-ring-width)` brand ring | Arrow Down/Up, Enter, Space open the panel — `tree-select.component.ts:101-110` |
| Active | Trigger shows selected node's `label` (`displayLabel`) — `tree-select.component.ts:81` | |
| Disabled | `tabindex="-1"`, `aria-disabled="true"`, dimmed via `aria-disabled:opacity-(--opacity-disabled)` (shared CVA) — `tree-select.component.ts:47,50` | Click/keydown handlers no-op |
| Loading | Not implemented | |
| Error | `aria-invalid="true"`, danger border/ring (shared `selectTriggerVariants`) — `tree-select.component.ts:51` | |
| Open/Closed | `aria-expanded` reflects `isOpen()` — `tree-select.component.ts:49` | Opens a connected overlay (`OverlayService.openConnected`) rendering `TreeSelectPanelComponent`; closes on selection or the overlay's own outside-click/Escape handling (no manual `closeRequested` plumbing — `tree-select.component.ts:17-22`) |

### Accessibility
- **Role/ARIA:** Trigger: `role="combobox"`, `aria-haspopup="tree"`, `aria-expanded`, `aria-disabled`, `aria-invalid` (`tree-select.component.ts:46-51`). Panel: a `med-tree` in `selectionMode="single"` (see Tree component for its own role semantics — `TreeSelectPanelComponent` adds none of its own, `projects/medra/ui/src/lib/tree-select/tree-select-panel.component.ts:27`).
- **Keyboard navigation:** Trigger responds to `ArrowDown` to open the panel — spec-verified: `tree-select.component.spec.ts:98-103 — 'ArrowDown on the trigger opens the panel'`. `ArrowUp`/`Enter`/`Space` are wired the same way in source (`tree-select.component.ts:101-110`) but only `ArrowDown` has a dedicated test `[not covered by tests for Up/Enter/Space]`. **In-panel traversal — resolved 2026-08-19:** once open, keyboard nav is delegated entirely to `TreeComponent` → `TreeNodeComponent`'s own Up/Down/Left/Right/Home/End roving-focus model (`tree-node.component.ts:158-203`, the same Wave 2 fix already covered by `tree-node.component.spec.ts`) — reused unmodified, not reimplemented here. Now exercised in the TreeSelect context by `tree-select.component.spec.ts` — `'ArrowDown moves focus to the next visible row; ArrowRight expands a collapsed node with children and moves into it'` and `'Enter on a focused row selects it and closes the panel, same as a click'`.
- **Selection/closing:** Picking a selectable leaf sets the value, updates the trigger label, and closes the panel — `tree-select.component.spec.ts:62-75 — 'picking a leaf node sets the value, shows its label, and closes the panel'`. A node with `selectable: false` renders without a `role` attribute and a click on it is a no-op, leaving the panel open — `tree-select.component.spec.ts:77-88 — 'a node marked selectable: false cannot be picked'`.
- **Disabled:** `setDisabledState(true)` blocks the trigger click from opening the panel — `tree-select.component.spec.ts:105-112 — 'setDisabledState(true) (Reactive Forms disable()) prevents opening'`.
- **Screen reader:** `displayLabel()` (selected node's `label`) is rendered as trigger text, or `placeholder()` in a dimmed span when empty (`tree-select.component.ts:57-60`); confirmed via `tree-select.component.spec.ts:47-50, 90-96`.
- **Overlay dismissal — resolved 2026-08-19:** Escape-to-close and outside-click dismissal were already handled for free by `OverlayService`'s own defaults (`closeOnEscape`/`closeOnOutsideClick`/`restoreFocus` all default `true` for a non-backdrop `openConnected()` call — TreeSelect never has to plumb `closeRequested` the way Select/CascadeSelect do, per the component's own doc comment `tree-select.component.ts:17-22`), just untested at this level. Now confirmed by `tree-select.component.spec.ts` under `describe('overlay dismissal (via OverlayService defaults)', ...)` — `'Escape closes the panel and returns focus to the trigger'` and `'a pointerdown+click outside the panel closes it and returns focus to the trigger'` (both assert focus lands back on the trigger, not just that the panel closed).
- **A11y verdict:** Covered — **resolved 2026-08-19**: combobox ARIA wiring, ArrowDown-to-open, selection-closes-panel, non-selectable nodes, disabled-blocks-open, Escape/outside-click dismissal with focus return, and in-panel keyboard traversal (reused from `TreeNodeComponent`) are all now spec-verified. `ArrowUp`/`Enter`/`Space` on the *closed* trigger (as opposed to Enter on an in-panel row, which is covered) remain untested individually, matching the same pattern as CascadeSelect's own accepted minor gaps.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use for hierarchical option sets (categories, file trees, org structures) | Don't reach for TreeSelect if you need multi-pick — it's single-selection only in v1 |
| Rely on `size`/`invalid` matching Select's own trigger look for visual consistency | Don't expect custom `closeRequested` handling — dismissal is fully delegated to `OverlayService`, whose Escape/outside-click/focus-return defaults are now spec-verified at the TreeSelect level too (**resolved 2026-08-19**) |
| Trust that a `selectable: false` node is inert (spec-verified: no `role`, click is a no-op), and that keyboard traversal inside the open panel (Up/Down/Left/Right/Home/End, Enter to select) works and is regression-tested (**resolved 2026-08-19**) | Don't assume `ArrowUp`/`Enter`/`Space` on the *closed trigger* each have their own dedicated test — only `ArrowDown` does |

### Code example (Angular)
```html
<med-tree-select [options]="treeNodes" [(ngModel)]="treeSelectDemoValue" name="demo-tree-select" class="max-w-sm" />
```
Source: `projects/showcase/src/app/app.html:1297`

### Source
- `projects/medra/ui/src/lib/tree-select/tree-select.component.ts`
- `projects/medra/ui/src/lib/tree-select/tree-select-panel.component.ts`
- `projects/medra/ui/src/lib/select/select.styles.ts` (shared `selectTriggerVariants`)
- `projects/medra/ui/src/lib/tree/tree.types.ts`
