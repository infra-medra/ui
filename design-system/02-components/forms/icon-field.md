## Component: IconField

### Description
`IconFieldComponent` (`med-icon-field`) is a plain positioning wrapper for overlaying a decorative (or clickable) icon on top of a text input — `<med-icon-field><med-icon medIconFieldIcon /><input medInputText class="pl-9" /></med-icon-field>`. Like `InputGroupComponent`, it doesn't reach into the projected `<input>` to add the padding that keeps typed text clear of the overlaid icon — the consumer adds that via the input's own `class` (`pl-9`/`pr-9`) (`projects/medra/ui/src/lib/icon-field/icon-field.component.ts:4-13`).

### Variants
| Variant | When to use |
|---|---|
| Left icon (`position="left"`, default, via `medIconFieldIcon`) | Search fields, prefix icons |
| Right icon (`position="right"`) | Status/validation icons, suffix icons |

### Props (Angular Inputs/Outputs)
`IconFieldComponent` itself has no `@Input()`s beyond content projection.

`IconFieldIconDirective` (`[medIconFieldIcon]`, applied to the icon):
| Property | Type | Default | Description |
|---|---|---|---|
| `position` | `IconFieldIconPosition` (`'left' \| 'right'`) | `'left'` | `projects/medra/ui/src/lib/icon-field/icon-field-icon.directive.ts:30` |
| `class` | `string` | `''` | `icon-field-icon.directive.ts:31` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Wrapper: `relative inline-block` (`icon-field.component.ts:18`). Icon: `absolute top-1/2 -translate-y-1/2 text-surface-400`, positioned `left-3` or `right-3` — `icon-field-icon.directive.ts:35-37` | — |
| Hover/Focus/Active | Not owned by IconField — delegated to the projected `<input>` | |
| Disabled | Not implemented at the wrapper level — belongs to the projected input | |
| Loading | Not implemented | |
| Error | Not implemented at the wrapper level — belongs to the projected input | |

The icon is `pointer-events-none` by default so a decorative icon doesn't steal clicks meant to focus the input underneath; override via `class="pointer-events-auto"` for a real clickable icon-button in that slot (`icon-field-icon.directive.ts:18-22`).

### Accessibility
- **Role/ARIA:** None found — pure positioning wrapper/directive, no `role`/`aria-*` attributes. `icon-field.component.spec.ts` confirms the wrapper only carries positioning classes (`relative` — `:29-33 — 'the wrapper is a positioning context for the overlaid icon'`) and the icon directive only class-based placement/pointer-events, never an ARIA attribute.
- **Keyboard navigation:** None found / not applicable.
- **Screen reader — investigated 2026-08-19, by design, not Partial:** `IconFieldComponent` renders nothing but `<ng-content />`, and `IconFieldIconDirective` (`medIconFieldIcon`) is a bare positioning directive applied *by the consumer* onto whatever element they project (`icon-field.component.spec.ts`'s own host template applies it to a plain `<span>`, not a `med-icon`) — neither of them ever renders icon markup themselves. Since IconField never owns the projected element's content, it has no basis to decide whether that content is decorative (needs `aria-hidden="true"`) or meaningful (e.g. the "real clickable icon-button" case the directive's own doc comment on `pointer-events-auto` already calls out) — that's a judgment call only the consumer, who knows what they projected, can make. `aria-hidden` is therefore correctly the consumer's own responsibility, not something IconField should set itself. Directly verified: `icon-field.component.spec.ts` — `"neither IconFieldComponent nor IconFieldIconDirective ever renders their own icon markup — `medIconFieldIcon` is purely a positioning directive applied to whatever the consumer projects — so a decorative icon's aria-hidden is correctly the consumer's own responsibility to set, and IconField passes it through untouched rather than stripping or overriding it (Wave 2 re-verdict evidence, By design not Partial)"` — asserts a consumer-set `aria-hidden="true"` on the projected element survives untouched.
- **Positioning coverage:** left-default and right-placement, plus the `pointer-events-auto` override for a clickable icon, are all directly spec-verified — `icon-field.component.spec.ts:35-46, 54-59`.
- **A11y verdict:** By design (not Partial) — **re-verdicted 2026-08-19**. IconField/`medIconFieldIcon` are pure positioning primitives over consumer-projected content; they never render icon markup of their own, so there is nothing for them to mark `aria-hidden`. Whether a given icon is decorative or meaningful is a fact only the consumer (who chose what to project) knows, so `aria-hidden` correctly stays the consumer's responsibility — matching the same "each element composes through its own escape hatch" philosophy this component already documents for input padding. This was previously mis-scored "Partial" as if it were an unimplemented feature; it's a deliberate, correct scope boundary instead.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Add matching padding (`pl-9`/`pr-9`) on the projected `<input>` yourself | Don't expect IconField to reserve space for the icon automatically — it's a pure positioning wrapper |
| Override to `pointer-events-auto` only when the icon is a real interactive control (spec-verified override path) | Leave `pointer-events-none` default in place for purely decorative icons — otherwise it can block input focus clicks |
| Set `aria-hidden="true"` yourself on a purely decorative projected icon — IconField passes it through untouched, verified 2026-08-19 | Assume IconField marks a decorative icon `aria-hidden` for you — it never renders or inspects the projected content, so this is always the consumer's call |
| Add `aria-hidden="true"` yourself on a purely decorative icon — IconField does not set it for you | Don't assume a named/labeled icon is automatically hidden from assistive tech — that responsibility isn't covered by this component or its tests |

### Code example (Angular)
```html
<med-icon-field class="w-48">
  <med-icon name="magnifying-glass" variant="mini" medIconFieldIcon class="size-4" />
  <input medInputText type="text" class="pl-9" placeholder="Search..." />
</med-icon-field>

<med-icon-field class="w-48">
  <input medInputText type="text" class="pr-9" placeholder="Amount" />
  <med-icon name="check-circle" variant="solid" medIconFieldIcon position="right" class="size-4 text-success-500" />
</med-icon-field>
```
Source: `projects/showcase/src/app/app.html:161-168`

### Source
- `projects/medra/ui/src/lib/icon-field/icon-field.component.ts`
- `projects/medra/ui/src/lib/icon-field/icon-field-icon.directive.ts`
