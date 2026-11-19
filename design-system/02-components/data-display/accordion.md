## Component: Accordion

### Description
A vertically stacked set of collapsible panels (`med-accordion` containing one or more `med-accordion-tab` children). Each tab renders its own header button and body, so multiple panels can be visible simultaneously in `multiple` mode — unlike Tabs, which shows only one panel and hides the rest. Use it to progressively disclose grouped content (FAQ sections, settings groups) where the user may want to compare or have open more than one section at once.

### Variants
| Variant | When to use |
|---|---|
| Single (`multiple` absent/`false`, default) | Only one panel open at a time; opening a panel closes any other (radio-like) — `projects/medra/ui/src/lib/accordion/accordion.component.ts:65-71` |
| Multiple (`multiple`) | Any number of panels can be open independently — `projects/medra/ui/src/lib/accordion/accordion.component.ts:65-67` |

### Props (Angular Inputs/Outputs)
**`AccordionComponent` (`med-accordion`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `multiple` | `boolean` (attribute) | `false` | Allows more than one tab expanded at once — `accordion.component.ts:37` |
| `activeIndex` | `number \| readonly number[] \| null` (model, two-way) | `null` | Index (single mode) or array of indices (multiple mode) of expanded tab(s) — `accordion.component.ts:38` |
| `class` | `string` | `''` | Extra classes merged onto the host — `accordion.component.ts:39` |

**`AccordionTabComponent` (`med-accordion-tab`)**
| Property | Type | Default | Description |
|---|---|---|---|
| `header` | `string` (required) | — | Text shown in the tab's header button — `accordion-tab.component.ts:50` |
| `disabled` | `boolean` (attribute) | `false` | Prevents the tab from being toggled or reached via arrow-key navigation — `accordion-tab.component.ts:51`, `accordion.component.ts:62,77` |

`expanded`, `panelId`, `headerButtonId` are internal signals pushed down by the parent `AccordionComponent`; the doc comment explicitly states they are "Not meant to be set directly by consumers" (`accordion-tab.component.ts:16`).

Note: `AccordionComponent` has no `ariaLabel`/accessible-name input of any kind — see Accessibility below.

### States
| State | Visual | Behavior |
|---|---|---|
| Default (collapsed) | Chevron rotated -90°, body `hidden` | `accordion-tab.component.ts:41,64` |
| Expanded | Chevron rotated to point down, body visible | `accordion-tab.component.ts:41,64` |
| Hover (enabled tab) | `hover:bg-surface-50` / dark `hover:bg-surface-700/50` on header | `accordion-tab.component.ts:60` |
| Focus | Native button focus outline (no custom focus-visible ring class found on the header button) | — |
| Active | N/A — no distinct pressed/active visual beyond hover found | — |
| Disabled | `opacity-(--opacity-disabled)`, `cursor-not-allowed`, `aria-disabled="true"` | Toggle and arrow-key focus skip disabled tabs — `accordion-tab.component.ts:32,60`; `accordion.component.ts:62,77` |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Each header is a real `<button>` inside an `<h3>`, with `aria-expanded`, `aria-controls` (pointing at the panel `id`), and `aria-disabled` when disabled — `accordion-tab.component.ts:30-32`. Each panel has `aria-labelledby` pointing back at its header button — `accordion-tab.component.ts:41`. This matches the WAI-ARIA APG "Accordion" pattern's header/panel wiring, per the component's own doc comment (`accordion.component.ts:22-26`). There is no `aria-label`/`aria-labelledby` on the `med-accordion` host itself, and no `role="region"` on panels [not covered by tests]. Confirmed by spec: `accordion.component.spec.ts` — `'all panels collapsed by default (activeIndex null)'` asserts every header button starts `aria-expanded="false"` and every panel starts `hidden`; `'clicking a header expands its panel and sets aria-expanded'` flips both; `'links each header to its panel via aria-controls/id and aria-labelledby'` asserts the `aria-controls`/`id` and `aria-labelledby`/`id` pairing; `'marks a disabled header with aria-disabled'` asserts `aria-disabled="true"` on a disabled tab's header.
- **Keyboard navigation:** ArrowUp/ArrowDown/Home/End move focus between enabled headers (`accordion.component.ts:84-105`), matching the APG pattern's "additional" arrow-key model described in the file's own doc — Tab still reaches every header (not roving tabindex) since multiple panels' content can be relevant at once (`accordion.component.ts:22-26`). Enter/Space toggle via native `<button>` activation (no custom keydown handler needed for that). Confirmed by spec: `accordion.component.spec.ts` — `'every header keeps normal tab order (no roving tabindex)'` asserts `tabIndex !== -1` on all headers (all real buttons, not roving `tabindex="-1"`); `'ArrowDown/ArrowUp move focus between headers, wrapping at the ends'` asserts focus moves 0→1 on ArrowDown, 1→0 on ArrowUp, and wraps 0→2 on ArrowUp from the first header; `'ArrowDown skips a disabled header'` asserts focus jumps from header 0 straight to header 2 when header 1 is disabled; `'Home/End move focus to the first/last enabled header'` asserts End moves focus to the last header and Home back to the first. Enter/Space activation itself is exercised only via `.click()` calls in the spec, not `KeyboardEvent` — native `<button>` semantics are relied on but not directly asserted by a keydown test [not covered by tests].
- **Screen reader:** `aria-expanded`/`aria-controls`/`aria-labelledby` wiring described above is the only SR-specific support found and is directly asserted by the spec tests cited above. No `aria-live` region for state changes [not covered by tests].

**A11y verdict:** Covered — header/panel ARIA wiring (`aria-expanded`, `aria-controls`, `aria-labelledby`, `aria-disabled`) and full arrow-key/Home/End navigation (including disabled-header skipping and wrap-around) are all directly asserted in `accordion.component.spec.ts`; the only gaps are a missing accessible name on the accordion host and no `role="region"` on panels, both cosmetic APG refinements rather than functional breaks.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `multiple` mode when panels' content should be independently comparable/open at once (`accordion.component.ts:65-67`) | Don't expect a built-in accessible name for the whole accordion group — no `ariaLabel` input exists on `AccordionComponent`; the showcase app passes a static `ariaLabel="FAQ"` attribute that does not bind to anything in the component (see Source/issues) |
| Set `disabled` on a tab to remove it from both click-toggle and arrow-key focus traversal (`accordion-tab.component.ts:51`, `accordion.component.ts:62,77`) | Don't rely on `activeIndex` being a single value in `multiple` mode — its runtime shape changes to `readonly number[]` (`accordion.component.ts:38,66-67`) |

### Code example (Angular)
```html
<med-accordion [(activeIndex)]="accordionActiveIndex" class="max-w-lg">
  <med-accordion-tab header="What is MedraUi?">
    An Angular component library.
  </med-accordion-tab>
  <med-accordion-tab header="Is it disabled?" [disabled]="true">
    This tab cannot be toggled.
  </med-accordion-tab>
  <med-accordion-tab header="Can I expand more than one at once?">
    Only with the multiple attribute.
  </med-accordion-tab>
</med-accordion>

<med-accordion multiple [(activeIndex)]="accordionMultipleActiveIndices" class="max-w-lg">
  <med-accordion-tab header="Profile">Profile settings.</med-accordion-tab>
  <med-accordion-tab header="Notifications">Notification settings.</med-accordion-tab>
  <med-accordion-tab header="Billing">Billing settings.</med-accordion-tab>
</med-accordion>
```
(Lifted from `projects/showcase/src/app/app.html:987-1012`.)

### Source
- `projects/medra/ui/src/lib/accordion/accordion.component.ts`
- `projects/medra/ui/src/lib/accordion/accordion-tab.component.ts`
- `projects/medra/ui/src/lib/accordion/accordion.tokens.ts` (`AccordionHost` DI coordinator abstract class)
- Showcase usage: `projects/showcase/src/app/app.html:987-1012`
