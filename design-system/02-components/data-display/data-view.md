## Component: DataView

### Description
A generic `T[]` renderer (`med-data-view`) that lays items out as a `'list'` or `'grid'`, with fully consumer-templated item markup via a single required projected `<ng-template let-item>`. Supports client-side sorting via a type-safe `sortComparator` function (rather than a field-name string, since `T` is fully generic) and optional pagination via the shared `med-paginator`. It intentionally has no built-in sort-toggle or list/grid-switcher UI — it reacts to whatever `layout`/`sortComparator` the consumer's own UI drives (`data-view.component.ts:27-31`).

### Variants
| Variant | When to use |
|---|---|
| List (`layout="list"`, default) | Vertical stack of items divided by `divide-y` — `data-view.component.ts:54,82` |
| Grid (`layout="grid"`) | Responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` layout — `data-view.component.ts:54,82` |
| Paginated (`paginator`) | Adds `med-paginator` below the items, slicing `sortedItems()` client-side — `data-view.component.ts:47-49,55-56,73-79` |
| Sorted (`sortComparator`) | Applies a consumer-supplied `(a: T, b: T) => number` comparator; `null` (default) preserves input order — `data-view.component.ts:20-25,57,68-71` |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `value` | `readonly T[]` | `[]` | Item data — `data-view.component.ts:53` |
| `layout` | `'list' \| 'grid'` | `'list'` | Layout mode — `data-view.component.ts:54` |
| `paginator` | `boolean` (attribute) | `false` | Enables pagination — `data-view.component.ts:55` |
| `rows` | `number` (attribute) | `10` | Items per page — `data-view.component.ts:56` |
| `sortComparator` | `((a: T, b: T) => number) \| null` | `null` | Client-side sort comparator — `data-view.component.ts:57` |
| `trackBy` | `(item: T, index: number) => unknown` | `(_item, index) => index` | `@for` track function — `data-view.component.ts:58,85-87` |
| `emptyLabel` | `string` | `'No results found'` | Text shown when `value` is empty — `data-view.component.ts:60` |
| `class` | `string` | `''` | Extra classes on the item container — `data-view.component.ts:61` |
| `first` | `number` (model) | `0` | Index of the first item of the current page — `data-view.component.ts:63` |
| `pageChange` | `output<PaginatorPageEvent>` | — | Emitted when the paginator changes page — `data-view.component.ts:64,48` |
| projected `<ng-template let-item>` | `TemplateRef` (required content child) | — | Item markup — `data-view.component.ts:66` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Items rendered per `layout()` | `data-view.component.ts:40-46` |
| Hover | Not implemented at the DataView level — item hover styling is entirely up to the consumer's projected template | — |
| Focus | Not implemented — DataView renders no focusable chrome of its own | — |
| Active | N/A — no selection concept in this component | — |
| Disabled | Not implemented | — |
| Loading | Not implemented | — |
| Empty | Centered `emptyLabel()` text (`col-span-full`) via `@empty` block — `data-view.component.ts:43-44` |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** None found. The container is a plain `<div>` with no `role="list"`/`role="grid"`, and item markup is entirely consumer-supplied via the projected template, so any semantics/ARIA on individual items must be added by the consumer. `data-view.component.spec.ts` confirms this by construction: every test queries items via a plain `.item` class selector on consumer-authored `<p>` tags (e.g. `'renders one projected item per entry in value, in the given order'`), never via a role or ARIA attribute — there is nothing DataView-level to assert.
- **Keyboard navigation:** None found — DataView itself renders no interactive/focusable elements. No spec test dispatches any keyboard event; all interaction in the spec is done by calling `paginator.first.set(...)` directly on the component instance (`'sorts before paginating (page 2 reflects sorted order, not source order)'`) rather than through a keyboard- or pointer-driven UI, since DataView delegates paging UI entirely to `med-paginator`.
- **Screen reader:** No `aria-live` region for pagination/empty-state changes found. The empty-state test (`'renders an empty state when value is empty'`) only asserts the empty label text is present, not that its appearance is announced [not covered by tests].

**A11y verdict:** Gap found — DataView renders no ARIA roles, no focusable elements, and no live region of its own; this is by design (it defers all interactive/semantic markup to the consumer's projected `<ng-template>`), but it means the component itself provides zero built-in accessibility and every consumer must supply role/labeling/live-region behavior manually.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Supply your own `sortComparator`/toggle UI — DataView does not provide sort-order controls itself (`data-view.component.ts:27-31`; confirmed by spec `'sortComparator reorders items without mutating the source array'`, which drives sorting entirely from the host's own comparator input) | Don't expect built-in ARIA list/grid semantics — none found in `data-view.component.ts`, and no spec test asserts a `role` on the container; add `role`/labeling on your own item template if needed |
| Reuse `med-paginator`'s `[(first)]`/`(pageChange)` the same way MultiSelect/AutoComplete list screens already do — same shared component (`data-view.component.ts:9`); confirmed by spec `'paginator=true slices items to the page size and renders <med-paginator>'` | Don't assume list/grid switching happens automatically — `layout` is just an input the consumer's own buttons must set; confirmed by spec `'applies grid classes when layout is grid, list classes otherwise'`, which only checks CSS classes react to the `layout` input, not that any UI toggles it |
| Rely on the sort-then-paginate ordering — confirmed by spec `'sorts before paginating (page 2 reflects sorted order, not source order)'`: page 2 reflects the *sorted* set, not the raw `value` order | Don't add your own `role="list"`/`role="grid"` expecting DataView to merge it with internal ARIA — there is no internal ARIA to conflict or coordinate with, so it is entirely your responsibility |

### Code example (Angular)
```html
<med-data-view [value]="dataViewProducts" [layout]="dataViewLayout" paginator [rows]="3" [sortComparator]="dataViewSortByPrice" class="max-w-[36rem]">
  <ng-template let-product>
    <div class="flex items-center justify-between py-2">
      <span>{{ product.name }}</span>
      <span class="text-surface-500">{{ '$' + product.price }}</span>
    </div>
  </ng-template>
</med-data-view>
```
(Lifted from `projects/showcase/src/app/app.html:450-457`.)

### Source
- `projects/medra/ui/src/lib/data-view/data-view.component.ts`
- Showcase usage: `projects/showcase/src/app/app.html:447-457`
