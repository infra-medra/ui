## Component: InputGroup

### Description
`InputGroupComponent` (`med-input-group`) is a flex wrapper that visually joins an input, buttons, and/or addons (`[medInputGroupAddon]`) into one continuous field. It deliberately doesn't auto-detect and restyle arbitrary projected content — each grouped element sheds its own corner radius through its own `class` input (e.g. `class="rounded-l-none"`), while `InputGroupComponent` itself only owns what nothing else already styles: collapsing the border gap between adjacent pieces (`-ml-px`) and keeping a focused piece's ring above its neighbors (`z-10`) (`projects/medra/ui/src/lib/input-group/input-group.component.ts:10-25`).

### Variants
Not applicable — no variant inputs beyond `class`. Composition (what's projected inside) determines the visual shape (leading addon, trailing addon, leading/trailing button, etc.).

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `class` | `string` | `''` | Extra classes merged onto the inner wrapper `<div>` — `input-group.component.ts:38` |

`InputGroupAddonDirective` (`[medInputGroupAddon]`, used for prefix/suffix spans):
| Property | Type | Default | Description |
|---|---|---|---|
| `size` | `InputGroupAddonSize` (`'sm' \| 'default' \| 'lg'`) | `'default'` | `projects/medra/ui/src/lib/input-group/input-group-addon.directive.ts:41` |
| `class` | `string` | `''` | `input-group-addon.directive.ts:42` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | `flex w-full items-stretch [&>*+*]:-ml-px` — borders of adjacent children overlap by 1px — `input-group.component.ts:41` | — |
| Hover | Not owned by InputGroup — delegated to each projected element's own hover state | |
| Focus | `[&>*:focus-within]:relative [&>*:focus-within]:z-10` and same for `:focus-visible` — raises the focused child's ring above its neighbors — `input-group.component.ts:41` | |
| Active | Not applicable at the wrapper level | |
| Disabled | Not implemented at the wrapper level — each projected control (input/button) owns its own disabled state | |
| Loading | Not implemented | |
| Error | Not implemented at the wrapper level — invalid styling belongs to the projected input (e.g. `medInputText`'s own `invalid`) | |

The addon directive (`InputGroupAddonDirective`) uses the shared field-size tokens for both axes (`px-(--spacing-field-*-x) py-(--spacing-field-*-y)`, `text-(length:--text-field-*)`) at all three sizes — `input-group-addon.directive.ts:16-18` — so an addon's height always matches the field(s) beside it.

### Accessibility
- **Role/ARIA:** None found — `InputGroupComponent` is a plain styling wrapper (`<ng-content />` only, no `role`/`aria-*`). `input-group.component.spec.ts` only asserts class-list membership (`'[&>*+*]:-ml-px'`, `'[&>*:focus-within]:z-10'`, addon `border-surface-300`/`bg-surface-100`/size tokens) — it never asserts any `role`, `aria-*`, or `tabindex`, which is consistent with the wrapper having no ARIA surface of its own by design, not an oversight.
- **Keyboard navigation:** None found / not applicable — no interactive behavior of its own. The `:focus-within`/`:focus-visible` z-index bump (`input-group.component.spec.ts:28-34 — 'collapses the border gap between adjacent children and bumps a focused one above its neighbors'`) is purely visual: it raises whichever projected child *already has* real DOM focus, it does not manage focus itself.
- **Screen reader:** None found — accessibility of the group depends entirely on the projected content (e.g. a `<label for>` associated with the inner `<input>`).
- **A11y verdict:** Covered — the wrapper has intentionally no ARIA/keyboard surface of its own, and the spec (class-list assertions only, no interactive behavior tested) is consistent with that scope; all real accessibility responsibility correctly sits on the projected controls.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Strip corner radius on each grouped element yourself (`class="rounded-l-none"` / `rounded-r-none` / `rounded-none`) | Don't expect `InputGroupComponent` to auto-restyle projected children — it deliberately doesn't reach into them |
| Use `medInputGroupAddon` with a matching `size` when the group's inputs/buttons use a non-default size (spec-verified: addon size tokens switch with `size`) | Don't add a wrapper-level `invalid`/`disabled` — those states live on the individual projected control |
| Give every projected input its own `<label>`/`aria-label` — the group itself provides zero screen-reader labeling | Don't expect the focus-ring z-index bump to move or manage focus — it only elevates whatever child already has native focus |

### Code example (Angular)
```html
<med-input-group class="w-48">
  <span medInputGroupAddon class="rounded-r-none">$</span>
  <input medInputText type="text" class="rounded-l-none" placeholder="0.00" />
</med-input-group>

<med-input-group class="w-56">
  <input medInputText type="text" class="rounded-r-none" placeholder="Search..." />
  <button medButton type="button" class="rounded-l-none">
    <med-icon name="magnifying-glass" variant="mini" />
  </button>
</med-input-group>
```
Source: `projects/showcase/src/app/app.html:140-154`

### Source
- `projects/medra/ui/src/lib/input-group/input-group.component.ts`
- `projects/medra/ui/src/lib/input-group/input-group-addon.directive.ts`
