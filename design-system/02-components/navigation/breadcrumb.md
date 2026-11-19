## Component: Breadcrumb

### Description
`Breadcrumb` (`<med-breadcrumb>`) is a non-interactive-by-default trail of ancestor links. It renders real `<a [href]>` elements for every navigable item (working links even without JS), plus an `itemSelect` output on click so a consumer using Angular Router can `preventDefault()` and navigate via `Router.navigateByUrl()` instead of a full page load. The library itself doesn't depend on `@angular/router`. The last item is always plain text with `aria-current="page"` (never a link), regardless of whether it has a `url` — it represents the current page. `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:6-17`

### Variants
| Variant | When to use |
|---|---|
| No visual variant axis. | — |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `readonly BreadcrumbItem[]` | `[]` | Trail entries: `{ label: string; url?: string; icon?: string; disabled?: boolean }`. `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:63`, `projects/medra/ui/src/lib/breadcrumb/breadcrumb.types.ts:1-6` |
| `ariaLabel` | `string` | `'Breadcrumb'` | Label on the wrapping `<nav>`. `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:65` |
| `class` | `string` (aliased) | `''` | Extra classes merged onto the `<ol>`. `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:66` |
| `itemSelect` (output) | `EventEmitter<{ item: BreadcrumbItem; event: MouseEvent }>` | — | Emitted on click of any non-last, non-disabled item; carries the raw `MouseEvent` so a consumer can `preventDefault()` for SPA routing. `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:68` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default (ancestor link) | `text-surface-500`, `hover:text-surface-700 hover:underline`. | Native `<a href>` navigation, plus `itemSelect` on click. `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:30-39` |
| Current (last item) | `font-medium text-surface-900`, not a link. | `aria-current="page"` always set, regardless of `url`. `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:40-52` |
| Disabled (non-last item) | Rendered as plain `<span>` (not a link), `text-surface-400`. | `aria-disabled="true"`; no click/`itemSelect`. `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:40-46` |
| Hover / Focus | Underline + darker text on hover for real links; native `<a>` focus outline. | — |
| Active | Not implemented (no distinct "active" state beyond "current/last"). | — |
| Loading | Not implemented | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** Wrapping `<nav [attr.aria-label]>`; the last item gets `aria-current="page"`; disabled non-last items get `aria-disabled="true"`. `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:25,44-45`. `aria-current="page"` on the last item (even when it has no `url`) is verified by `breadcrumb.component.spec.ts — 'always renders the last item as non-link text with aria-current="page", even if it has no url'`, and its absence on earlier items by `breadcrumb.component.spec.ts — 'does not mark non-last items as the current page'`. `aria-disabled="true"` on a disabled non-last item (rendered as `<span>`, not `<a>`) is verified by `breadcrumb.component.spec.ts — 'renders a disabled item as non-link text with aria-disabled'`.
- **Keyboard navigation:** None beyond native `<a>` Tab order — plain individually-tabbable links, not a composite roving-tabindex widget (same reduced-scope reasoning noted for `Steps`). `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts:1-17`. Consistent with source: no `(keydown)` handler exists on any element in the template, so there is nothing custom for a test to exercise, and none does.
- **Screen reader:** `aria-current="page"` on the current item (spec-verified above). Item icons are decorative and confirmed hidden: `IconComponent` sets `[attr.aria-hidden]="ariaLabel() ? null : 'true'"` (`projects/medra/ui/src/lib/icon/icon.component.ts:50`), and `Breadcrumb` never passes `ariaLabel` to its `<med-icon>` instances (`breadcrumb.component.ts:36,48`), so every breadcrumb icon renders `aria-hidden="true"` automatically — resolves the `[to confirm]` from the prior pass. `itemSelect` carries the raw `MouseEvent`, letting a router-backed consumer call `preventDefault()` — the emission itself (item + event) is verified by `breadcrumb.component.spec.ts — 'emits itemSelect with the item and native event when a link is clicked'`.

**A11y verdict:** Covered — `aria-current`, `aria-disabled`, and decorative-icon `aria-hidden` are all confirmed either by direct spec assertions or by precise source citation (icon.component.ts:50 plus breadcrumb never setting `ariaLabel` on its icons); keyboard behavior is intentionally native-only with no custom logic to under-test.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Provide a real `url` per item so `<a href>` works even without JS; intercept `itemSelect`'s `event.preventDefault()` for SPA routing. | Don't expect the last item to ever render as a link, even if it has a `url` — it's always plain text with `aria-current="page"` (spec-verified). |
| Use `disabled` to show an unreachable ancestor without a working link. | Don't rely on `itemSelect` firing for the last or a disabled item — it only fires for enabled, non-last items. |
| Pass an `icon` per item without worrying about screen-reader noise — `IconComponent` auto-applies `aria-hidden="true"` when no `ariaLabel` is set, and `Breadcrumb` never sets one on its icons. | Don't add a separate `aria-hidden` wrapper around breadcrumb icons yourself — it's already handled internally and would be redundant. |

### Code example (Angular)
```html
<med-breadcrumb [items]="breadcrumbItems" />
```

### Source
- `projects/medra/ui/src/lib/breadcrumb/breadcrumb.component.ts`
- `projects/medra/ui/src/lib/breadcrumb/breadcrumb.types.ts`
- Usage: `projects/showcase/src/app/app.html:890-893`
