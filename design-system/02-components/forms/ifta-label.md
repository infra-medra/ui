## Component: IftaLabel

### Description
`IftaLabelComponent` (`med-ifta-label`) implements the "In-Field Top-Aligned" label pattern — unlike `FloatLabelComponent`, the label never moves; it's always small and pinned to the top of the field, stacked above the value. Since there's no dynamic `:focus`/`:placeholder-shown` state to track, this is a plain static flex-column layout, not a CSS peer-selector trick (`projects/medra/ui/src/lib/ifta-label/ifta-label.component.ts:5-9`). The wrapper owns the field's single border/background/focus-ring (`focus-within:*`, since the actual focusable element is the input, not the wrapper); the input strips its own border/padding via its own `class`.

### Variants
Not applicable — a single visual pattern, no size/severity variant inputs. Notably, there is no `sm`/`default`/`lg` size scale here (see Issues below).

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Merged onto the wrapper `<div>` — `ifta-label.component.ts:34` |

`IftaLabelTextDirective` (`[medIftaLabelText]`, applied to the `<label>`):
| Property | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | `projects/medra/ui/src/lib/ifta-label/ifta-label-text.directive.ts:11` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | `flex flex-col gap-0.5 rounded-md border border-surface-300 bg-surface-0`, horizontal padding via `px-(--spacing-field-x)` but vertical padding hardcoded (`pt-1.5 pb-1`, not a `--spacing-field-y` token) — `ifta-label.component.ts:38` | — |
| Focus | `focus-within:border-brand-500 focus-within:ring-(--focus-ring-width) focus-within:ring-brand-500` on the wrapper — `ifta-label.component.ts:40` | |
| Disabled | Not implemented at the wrapper/label level — belongs to the projected input | |
| Error | Not implemented at the wrapper/label level — belongs to the projected input (e.g. `medInputText`'s own `invalid`) | |

The top label itself is static: `text-xs text-surface-500` at all times (`ifta-label-text.directive.ts:13`) — no focus-state color change (contrast with FloatLabel's `peer-focus:text-brand-600`).

### Accessibility
- **Role/ARIA:** None found — pure layout wrapper/directive. The `<label for="...">`/`<input id="...">` association is standard HTML, supplied by the consumer. `ifta-label.component.spec.ts` never asserts any `role`/`aria-*`, consistent with this being purely visual.
- **Keyboard navigation:** None found / not applicable.
- **Screen reader:** Relies on the consumer wiring a correct `for`/`id` pair; the component provides no automatic labelling or `aria-describedby`.
- **Layout correctness:** the label is confirmed to render as the *first* DOM child, above the input, inside a bordered flex-column box — spec-verified: `ifta-label.component.spec.ts:25-32 — 'renders the label above the input in a bordered field box'` (asserts child tag order `['LABEL', 'INPUT']`). The wrapper's focus ring reacts to `focus-within` (the projected input's focus), not a `:focus` state of its own — spec-verified: `:34-38 — "the field box reacts to focus-within, not its own :focus"`. The label's static (non-color-changing) styling is spec-verified: `:40-44 — 'the label is small and muted'`.
- **A11y verdict:** Covered — the component correctly has no ARIA surface of its own (delegated to consumer-supplied `for`/`id`), and the DOM order (label-before-input) plus `focus-within` delegation that make the pattern usable are directly spec-verified.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Strip the projected input's own border/background/focus-ring (`class="border-0 bg-transparent p-0 focus:ring-0 focus:outline-none"`) — the wrapper already owns those | Don't expect the label to change color on focus like FloatLabel does — it's a static `text-surface-500` at all times (spec-confirmed, no `peer-focus:*` classes exist here) |
| Match `for`/`id` between the label and input yourself | Don't reach for this if you need `sm`/`lg` field sizing — no size variant exists |
| Put the `<label medIftaLabelText>` before the `<input>` in markup — the spec locks in this DOM order as part of the layout contract | Don't rely on the wrapper's own `:focus` — only `focus-within` (from the projected input) is wired |

### Code example (Angular)
```html
<med-ifta-label class="w-48">
  <label medIftaLabelText for="ifta-username">Username</label>
  <input medInputText id="ifta-username" placeholder="Username" class="border-0 bg-transparent p-0 focus:ring-0 focus:outline-none" [(ngModel)]="iftaLabelDemoValue" name="ifta-username" />
</med-ifta-label>
```
Source: `projects/showcase/src/app/app.html:190-193`

### Source
- `projects/medra/ui/src/lib/ifta-label/ifta-label.component.ts`
- `projects/medra/ui/src/lib/ifta-label/ifta-label-text.directive.ts`
