## Component: Fieldset

### Description
A real `<fieldset>`/`<legend>` grouping container for form controls (`projects/medra/ui/src/lib/fieldset/fieldset.component.ts:9-23`), not a generic `<div>`/`<h3>` like Panel — the semantic elements matter here: a screen reader announces the `legend` as context for every control inside, and `disabled` cascades to every descendant form control automatically via native `<fieldset disabled>` behavior, with no custom per-child logic needed. Optionally toggleable/collapsible: the whole legend is clickable (bigger mouse hit target) via a click handler that bubbles up from a real, independently keyboard-accessible toggle `<button medButton>` inside it (`fieldset.component.ts:19-23`, `:32-49`).

### Variants
No visual `variant` input. The only structural variation is whether the fieldset is toggleable (collapsible) or not.

| Mode | When to use |
|---|---|
| Non-toggleable (default) | Static grouping, always expanded — no chevron button rendered (`fieldset.component.ts:34-48`, conditional `@if (toggleable())`) |
| `toggleable` | Adds a chevron toggle button; content can be collapsed/expanded, state exposed via `[(collapsed)]` (`fieldset.component.ts:58-59`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `legend` | `string` | `''` | Text content of the `<legend>` (`fieldset.component.ts:57`) |
| `toggleable` | `boolean` | `false` | Shows a collapse/expand chevron button in the legend (`fieldset.component.ts:58`) |
| `collapsed` | `model<boolean>` | `false` | Two-way-bindable collapsed state (`fieldset.component.ts:59`) |
| `disabled` | `boolean` | `false` | Sets native `[disabled]` on the `<fieldset>`, cascading to all descendant form controls (`fieldset.component.ts:60`, `:31`) |
| `expandLabel` | `string` | `'Expand'` | `aria-label` for the toggle button when collapsed (`fieldset.component.ts:62`) |
| `collapseLabel` | `string` | `'Collapse'` | `aria-label` for the toggle button when expanded (`fieldset.component.ts:63`) |
| `class` | `string` | `''` | Extra classes on the `<fieldset>` element (`fieldset.component.ts:64`, `:68-70`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default (expanded) | Content visible (`[hidden]="collapsed()"` false) (`fieldset.component.ts:50`) | — |
| Collapsed | Content `hidden`, chevron rotated `-rotate-90` (`fieldset.component.ts:77-79`) | Content stays in the DOM (`[hidden]`, not `@if`) |
| Hover (legend, toggleable) | `cursor-pointer` on legend (`fieldset.component.ts:74`) | Clicking the legend toggles collapse |
| Focus | Toggle button inherits Button's `focus-visible:ring-*` (via `medButton`) | Keyboard-focusable independent of the legend click handler |
| Disabled | Native `<fieldset [disabled]>` cascades to every descendant form control (`fieldset.component.ts:31`) | All nested inputs/buttons become inert automatically (browser-native, no custom logic) |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Toggle button: `[attr.aria-expanded]="!collapsed()"`, `[attr.aria-controls]="contentId"`, `[attr.aria-label]="collapsed() ? expandLabel() : collapseLabel()"` (`fieldset.component.ts:43-44`) — directly tested: `fieldset.component.spec.ts` — `'sets aria-expanded and aria-controls correctly on the toggle button'` (verifies both the id match and the `true`→`false` transition on click), `'uses custom expand/collapse labels'` (verifies the `aria-label` swap between `expandLabel`/`collapseLabel`). Uses native `<fieldset>`/`<legend>` semantics otherwise.
- **Keyboard navigation:** Toggle button is a real `<button medButton>`, so Enter/Space activation is native (no custom keydown handling, per the component's own doc comment at `fieldset.component.ts:19-23`). The legend itself also has a `(click)` handler for a bigger mouse hit target, and the spec confirms the two don't double-toggle when the button (nested inside the legend) is clicked — the click bubbles once, not twice (`fieldset.component.spec.ts` — `'the toggle button click toggles exactly once, not twice (no double bubble)'`).
- **Screen reader:** `legend` text is announced as the group's accessible context for all descendant form controls (native `<legend>` behavior); `aria-controls` links the toggle button to the collapsible content region by id. The `disabled` input's native `<fieldset disabled>` cascade — the exact behavior a screen reader user relies on to know nested controls are inert — is asserted on the `<fieldset>` element's own `.disabled` property in the Jest spec (jsdom can't simulate the cascade itself, per `fieldset.component.spec.ts:143-147`), and on the real descendant-cascading behavior in a Chromium e2e test: `e2e/fieldset.spec.ts` — `'disabled fieldset cascades to descendant form controls in a real browser'` (asserts a nested input and button are both disabled) and `'enabled fieldset does not disable its descendant form controls'` (negative control).
- **Focus:** Toggle button inherits Button's `focus-visible:ring-*` (via `medButton`), independently keyboard-focusable regardless of the legend's own click handler.

**A11y verdict:** Covered — `aria-expanded`/`aria-controls`/`aria-label` and the legend/button double-toggle guard are directly tested in Jest; the component's core `disabled`-cascades-to-descendants accessibility claim (the reason Fieldset exists instead of Panel, per its own doc comment) is now directly tested too, via a Chromium e2e test (`e2e/fieldset.spec.ts`) since jsdom can't simulate the native cascade itself.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use Fieldset (not Panel) specifically when grouping real form controls, to get native `disabled` cascading | Using Fieldset for non-form content groupings — Panel is the generic container |
| Rely on `[disabled]="true"` to disable every nested control at once | Manually disabling each nested input when the parent Fieldset is already disabled — redundant, native cascading already handles it |
| Run `npm run e2e` after changing this component, since the descendant-disabling cascade is only regression-tested there | Trusting the Jest suite alone to catch a regression in descendant-disabling — jsdom can't simulate it (`fieldset.component.spec.ts:143-147`), only `e2e/fieldset.spec.ts` can |

### Code example (Angular)
```html
<med-fieldset legend="Shipping address" toggleable [(collapsed)]="fieldsetCollapsed">
  <div class="flex flex-col gap-2">
    <input medInputText type="text" placeholder="Street" />
    <input medInputText type="text" placeholder="City" />
  </div>
</med-fieldset>
<med-fieldset legend="Disabled — every field below is inert" [disabled]="true">
  <div class="flex flex-col gap-2">
    <input medInputText type="text" placeholder="Card number" />
    <button medButton type="button" size="sm">Save card</button>
  </div>
</med-fieldset>
```
(from `projects/showcase/src/app/app.html:756-761`, `:765-770`)

### Source
- `projects/medra/ui/src/lib/fieldset/fieldset.component.ts`
