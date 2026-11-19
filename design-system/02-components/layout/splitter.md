## Component: Splitter

### Description
A resizable-panes layout primitive built from three content-projected pieces: `<med-splitter>` containing alternating `<med-splitter-panel>` and `<med-splitter-gutter>` children (`projects/medra/ui/src/lib/splitter/splitter.component.ts:18-47`). Gutters are explicit, consumer-authored elements — not auto-inserted between panels — unlike some other libraries' array-of-panel-configs API; the consumer is trusted to alternate panel/gutter/panel correctly. `sizes` (percentages per panel, summing to ~100) is a `model()`: set it for a custom initial split, or leave it `null` for an equal split; it stays two-way-bound as the user drags a gutter. The host is the flex container (`flex-row`/`flex-col`) and **the consumer must size it** (e.g. `class="h-96"`) — there's no sane default height/width for an arbitrary pane layout. Scope cut for v1: no nested/recursive splitters, no drag-to-resize persistence.

### Variants
| Orientation | When to use |
|---|---|
| `horizontal` (default) | Panels arranged left-to-right, gutter is a vertical bar (`w-1 cursor-col-resize`) (`splitter.component.ts:59`, `:69`; `splitter-gutter.component.ts:61`) |
| `vertical` | Panels arranged top-to-bottom, gutter is a horizontal bar (`h-1 cursor-row-resize`) (`splitter-gutter.component.ts:61`) |

### Props (Angular Inputs/Outputs)
**`med-splitter` (`SplitterComponent`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Split axis (`splitter.component.ts:59`) |
| `sizes` | `model<readonly number[] \| null>` | `null` | Per-panel percentages; falls back to an equal split when unset or length mismatches panel count (`splitter.component.ts:60`, `:72-80`) |
| `class` | `string` | `''` | Extra classes on the host flex container (`splitter.component.ts:61`) |

**`med-splitter-panel` (`SplitterPanelComponent`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `minSize` | `number` | `5` | Minimum size as a percentage of the splitter's main axis; clamps drag/keyboard resize (`splitter-panel.component.ts:22`) |
| `class` | `string` | `''` | Extra classes on the panel (`splitter-panel.component.ts:23`) |

**`med-splitter-gutter` (`SplitterGutterComponent`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Disables drag/keyboard resize for this gutter (`splitter-gutter.component.ts:46`) |
| `ariaLabel` | `string` | `'Resize'` | Accessible name for the separator (`splitter-gutter.component.ts:48`) |
| `class` | `string` | `''` | Extra classes on the gutter (`splitter-gutter.component.ts:49`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Gutter: `bg-surface-200` / `dark:bg-surface-700` (`splitter-gutter.component.ts:59`) | — |
| Hover (gutter) | `hover:bg-brand-300` / `dark:hover:bg-brand-600` (`splitter-gutter.component.ts:59`) | Pointer only |
| Focus (gutter) | `focus-visible:ring-(--focus-ring-width) ring-inset ring-brand-500` (`splitter-gutter.component.ts:60`) | Arrow keys nudge the split by 1 percentage point per press (`splitter.component.ts:16`, `:129-135`; `splitter-gutter.component.ts:87-114`) |
| Active (dragging) | No dedicated "dragging" class found — pointer capture is set on the gutter element during drag (`splitter-gutter.component.ts:72`) | `pointerdown`/`pointermove`/`pointerup`/`pointercancel` drive resize (`splitter-gutter.component.ts:67-85`) |
| Disabled (gutter) | `pointer-events-none opacity-(--opacity-disabled)` (`splitter-gutter.component.ts:62`) | `tabindex="-1"`; pointer/keyboard handlers early-return (`splitter-gutter.component.ts:32`, `:68`, `:77`, `:88`) |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Gutter follows the WAI-ARIA APG "Window Splitter" pattern: `role="separator"`, `[attr.aria-orientation]`, `[attr.aria-valuenow]` (rounded percentage of the panel *before* the gutter), `aria-valuemin="0"`, `aria-valuemax="100"`, `[attr.aria-label]` (`splitter-gutter.component.ts:26-32`). Deliberately not `role="slider"`, since a slider implies a value the separator itself represents rather than a boundary between two other things (doc at `splitter-gutter.component.ts:15-19`). Directly tested: `splitter.component.spec.ts` — `'the gutter reports role=separator with aria-orientation and aria-valuenow matching the panel before it'` (asserts all three attributes together, including the numeric value), `'vertical orientation uses ArrowUp/ArrowDown and reports aria-orientation="vertical"'`.
- **Keyboard navigation:** Gutter is focusable (`tabindex="0"` unless disabled) and responds to ArrowLeft/ArrowRight (horizontal) or ArrowUp/ArrowDown (vertical) to nudge the split by `KEYBOARD_STEP` (1 percentage point) (`splitter.component.ts:16`; `splitter-gutter.component.ts:87-114`). Extensively tested: `'ArrowRight/ArrowLeft step-resize the horizontal split by 1%'`, `'vertical orientation uses ArrowUp/ArrowDown...'` (also confirms the *wrong*-axis key, `ArrowRight` in vertical mode, is correctly a no-op — `event.preventDefault()` is only called for the axis-matching keys, `splitter-gutter.component.ts:94-108`), `'a disabled gutter is not focusable and ignores pointer/keyboard input'` (asserts `tabindex="-1"` and that `ArrowRight` has no effect). Drag-resize (pointer events) is equally well covered: `'dragging the gutter resizes both neighboring panels and updates the sizes model'`, `'clamps a drag so neither panel goes below its minSize'`, `'pointerup ends the drag — further pointermove has no effect'`.
- **Screen reader:** `ariaLabel` (default `'Resize'`) names each gutter; `aria-valuenow` communicates the current split percentage as it changes — both directly tested (see above).

**A11y verdict:** Covered — this is the most thoroughly tested component in this batch: role, `aria-orientation`, `aria-valuenow`, keyboard step-resize on the correct axis only, pointer drag-resize with `minSize` clamping, and the disabled state (unfocusable, inert to both pointer and keyboard) are all directly exercised by dedicated tests, matching the WAI-ARIA APG "Window Splitter" pattern precisely.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Alternate `<med-splitter-panel>` and `<med-splitter-gutter>` children correctly in the template | Relying on the library to auto-insert gutters — they must be authored explicitly |
| Size the `<med-splitter>` host explicitly (e.g. `class="h-96"`) | Expecting a default height/width — there is none |
| Set `minSize` per panel to prevent it from being resized away entirely | Expecting `minSize` to also cap the *other* side — it only clamps the panel it's set on, symmetric only if both panels have one (`splitter.component.spec.ts` — `'clamps a drag so neither panel goes below its minSize'` clamps panel A at its `minSizeA`) |
| Pass `sizes` matching the panel count exactly | Passing a `sizes` array whose length doesn't match the panel count — silently falls back to an equal split instead of erroring (`splitter.component.spec.ts` — `'falls back to an equal split when sizes length does not match the panel count'`) |

### Code example (Angular)
```html
<med-splitter class="h-48 max-w-lg rounded-lg border border-surface-200 dark:border-surface-700" [(sizes)]="splitterSizes">
  <med-splitter-panel [minSize]="15" class="flex items-center justify-center text-sm">Panel A</med-splitter-panel>
  <med-splitter-gutter ariaLabel="Resize panels" />
  <med-splitter-panel [minSize]="15" class="flex items-center justify-center text-sm">Panel B</med-splitter-panel>
</med-splitter>
```
(from `projects/showcase/src/app/app.html:1109-1113`)

### Source
- `projects/medra/ui/src/lib/splitter/splitter.component.ts`
- `projects/medra/ui/src/lib/splitter/splitter-panel.component.ts`
- `projects/medra/ui/src/lib/splitter/splitter-gutter.component.ts`
- `projects/medra/ui/src/lib/splitter/splitter.tokens.ts`
- `projects/medra/ui/src/lib/splitter/splitter.types.ts`
