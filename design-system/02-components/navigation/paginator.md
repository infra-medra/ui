## Component: Paginator

### Description
`Paginator` (`<med-paginator>`) is a page-navigation control for a paged data set: Previous/Next buttons plus a contiguous window of page-number buttons centered on the current page (clamped at the edges) — no pinned first/last page + ellipsis pattern (`1 … 4 5 [6] 7 8 … 42`) for v1. `first` (0-based index of the first record on the current page) is a `model()` for `[(first)]`; `pageChange` additionally emits the full page-count context. `projects/medra/ui/src/lib/paginator/paginator.component.ts:12-22`

### Variants
| Variant | When to use |
|---|---|
| `showSummary` (`true`, default) | Shows the "Showing X-Y of Z" summary text alongside the page controls. |
| `showSummary` (`false`) | Hides the summary, leaving just Previous/page-numbers/Next. `projects/medra/ui/src/lib/paginator/paginator.component.ts:32,70` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `totalRecords` | `number` (`numberAttribute`) | `0` | Total record count driving `pageCount`. `projects/medra/ui/src/lib/paginator/paginator.component.ts:67,84` |
| `rows` | `number` (`numberAttribute`) | `10` | Records per page. `projects/medra/ui/src/lib/paginator/paginator.component.ts:68` |
| `pageLinkCount` | `number` (`numberAttribute`) | `5` | Max number of visible page-number buttons in the window. `projects/medra/ui/src/lib/paginator/paginator.component.ts:69,89-97` |
| `showSummary` | `boolean` (`booleanAttribute`) | `true` | Toggles the summary text. `projects/medra/ui/src/lib/paginator/paginator.component.ts:70` |
| `first` | `model<number>` | `0` | Two-way bindable 0-based index of the first record on the current page. `projects/medra/ui/src/lib/paginator/paginator.component.ts:71` |
| `ariaLabel` | `string` | `'Pagination'` | Label on the `<nav>`. `projects/medra/ui/src/lib/paginator/paginator.component.ts:74` |
| `previousLabel` / `nextLabel` / `pageLabel` | `string` | `'Previous page'` / `'Next page'` / `'Page'` | Accessible labels for the prev/next buttons and each page button's `aria-label` prefix. `projects/medra/ui/src/lib/paginator/paginator.component.ts:75-77` |
| `summaryLabelTemplate` | `(first, last, total) => string` | `` `Showing ${first}-${last} of ${total}` `` | Customizable summary text formatter. `projects/medra/ui/src/lib/paginator/paginator.component.ts:78-80` |
| `pageChange` (output) | `EventEmitter<PaginatorPageEvent>` | — | `{ first, rows, page, pageCount }`, emitted on every page change. `projects/medra/ui/src/lib/paginator/paginator.component.ts:5-10,82` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default page button | `variant="text" severity="secondary"`. | — |
| Current page | `variant="filled" severity="primary"`, `aria-current="page"`. | `projects/medra/ui/src/lib/paginator/paginator.component.ts:47-49` |
| Disabled (Previous at first page / Next at last page) | `[disabled]` on the prev/next buttons via `canPrev()`/`canNext()`. | `projects/medra/ui/src/lib/paginator/paginator.component.ts:37,58,86-87` |
| Hover/Focus | Native `ButtonDirective` hover/focus per button. | — |
| N/A: Loading, Error | Not implemented — Paginator has page-state (current/disabled edges) instead. | — |

### Accessibility
- **Role/ARIA:** Wrapping `<nav [attr.aria-label]>`; current page button gets `aria-current="page"`; every page button has an `aria-label` combining `pageLabel` + the 1-based page number; prev/next icon-only buttons get their own `aria-label`. `projects/medra/ui/src/lib/paginator/paginator.component.ts:31,37,49-50,58` — the `aria-label="Page N"` format is exercised implicitly by every page-button assertion in `paginator.component.spec.ts` (its `pageButtons()` helper selects `button[aria-label^="Page "]`), and `aria-current="page"` is directly verified by `'marks the current page with aria-current="page"'` and `'first supports two-way binding via [(first)]'`.
- **Previous/Next use native `disabled`, not just visual dimming:** verified by `paginator.component.spec.ts — 'disables Previous on the first page and Next on the last page'`, correctly removing them from the Tab order/AT interaction at the edges of the page range.
- **Zero-record edge case is accessible, not just non-crashing:** with `totalRecords=0`, the component still renders exactly one "Page 1" button (current, but not disabled) with both Previous and Next disabled — verified by `paginator.component.spec.ts — 'treats zero total records as a single, empty page and does not crash'`. No dead-end empty toolbar with nothing focusable.
- **Keyboard navigation — resolved 2026-08-19:** the `<ul>` wrapping Previous, every visible page button, and Next now carries `role="toolbar"` and implements the ARIA APG roving-tabindex pattern (same as `Dock`/`Steps`): one control is the single Tab stop at a time, ArrowLeft/Right move the roving stop across the whole `[Prev, ...pages, Next]` set with wraparound, Home/End jump to the first/last *enabled* control, and a disabled Prev/Next is skipped over rather than being a dead stop. The roving stop defaults to whichever control represents the current page. Confirmed by `paginator.component.spec.ts` — `'role="toolbar" wraps Prev, the page buttons, and Next as a single group'`, `'roving tabindex: only one control is in the Tab order at a time, defaulting to the current page'`, `'ArrowRight moves the roving tab stop across page buttons and onto Next'`, `'ArrowLeft from the first page skips the disabled Prev and wraps to Next'`, `'Home/End jump the roving tab stop to the first/last enabled control'`. `projects/medra/ui/src/lib/paginator/paginator.component.ts:169-238`
- **Screen reader:** All labels (`ariaLabel`, `previousLabel`, `nextLabel`, `pageLabel`, `summaryLabelTemplate`) are configurable inputs, defaulting to English text — supports i18n by consumer override. **Resolved 2026-08-19:** now verified by `paginator.component.spec.ts — 'overrides previousLabel/nextLabel/pageLabel via their aria-label inputs'` and `'overrides the summary text via summaryLabelTemplate'`, both asserting the overridden text actually renders (previously source-evidenced only).

**A11y verdict:** Covered — **both gaps resolved 2026-08-19**: the i18n override inputs (`previousLabel`/`nextLabel`/`pageLabel`/`summaryLabelTemplate`) now have direct test coverage, and Prev/page-buttons/Next form a single ARIA APG roving-tabindex toolbar with Arrow/Home/End navigation and disabled-Prev/Next skipping — see the Keyboard navigation section above for the tests.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Bind `[(first)]` for simple two-way sync, and/or listen to `(pageChange)` when you need `pageCount` context in the same handler. | Don't expect a "jump to page N" input field or first/last-page-pinned ellipsis layout — only a centered contiguous window is implemented. |
| Override `summaryLabelTemplate`/`*Label` inputs for non-English locales — verified by `paginator.component.spec.ts — 'overrides previousLabel/nextLabel/pageLabel via their aria-label inputs'` and `'overrides the summary text via summaryLabelTemplate'`. | Don't expect every visible page button to be individually Tab-reachable — the toolbar uses roving tabindex, so Tab lands on one control (Prev, a page, or Next) and Arrow keys move between the rest. |
| Trust the zero-records case to render a safe, fully-disabled single "Page 1" control rather than an empty/broken toolbar. `paginator.component.spec.ts — 'treats zero total records as a single, empty page and does not crash'` | Don't rely on Home/End landing on Prev/Next specifically — they jump to the first/last *enabled* control, which skips a disabled Prev or Next. |

### Code example (Angular)
```html
<med-paginator [totalRecords]="87" [rows]="10" [(first)]="paginatorFirst" class="max-w-lg" />
```

### Source
- `projects/medra/ui/src/lib/paginator/paginator.component.ts`
- Usage: `projects/showcase/src/app/app.html:895-899`
