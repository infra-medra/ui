## Component: Skeleton

### Description
`SkeletonComponent` (`med-skeleton`) is a loading placeholder shape. The host element itself is the box — no wrapping markup, the same convention as `Divider` (`projects/medra/ui/src/lib/skeleton/skeleton.component.ts:7-8`). Purely presentational: no internal state, no timer, and deliberately no `role="status"` of its own. `aria-hidden="true"` is set unconditionally (`skeleton.component.ts:36`) — a screen reader has nothing useful to announce about an empty placeholder box, and stacking several (a common "list of skeleton rows while data loads" pattern) would otherwise read as a wall of unlabeled elements. A consumer that wants the "Loading" announcement itself already has `ProgressSpinner` (`role="status"`) for that — wrapping a group of skeletons in one is the consumer's call, documented explicitly as not this component's job (`skeleton.component.ts:8-15`).

`width`/`height`/`borderRadius` are plain CSS length strings bound via `[style]`, not Tailwind classes — they mirror real, per-instance content dimensions (a skeleton for a specific thumbnail size, an avatar-sized circle), which the source explicitly justifies as "not a reusable design-system choice to begin with" (`skeleton.component.ts:17-25`).

### Variants
| Variant | When to use |
|---|---|
| `shape="rectangle"` (default) | General placeholder (text lines, cards, thumbnails) |
| `shape="circle"` | Avatar-style placeholder |
| `animation="wave"` (default) | Shimmer sweep via `--animate-skeleton-wave` |
| `animation="none"` | Static placeholder, no shimmer |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `shape` | `SkeletonShape` (`'rectangle'\|'circle'`) | `'rectangle'` | `skeleton.component.ts:41` |
| `animation` | `SkeletonAnimation` (`'wave'\|'none'`) | `'wave'` | `skeleton.component.ts:42` |
| `width` | `string` | `'100%'` | `skeleton.component.ts:43` |
| `height` | `string` | `'1rem'` | `skeleton.component.ts:44` |
| `size` | `string \| null` | `null` | Overrides both `width` and `height` at once — mainly for `shape="circle"`, where the two are always equal — `skeleton.component.ts:45-46` |
| `borderRadius` | `string \| null` | `null` | `skeleton.component.ts:47` |
| `class` | `string` (aliased) | `''` | `skeleton.component.ts:48` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default (wave) | `bg-surface-200 dark:bg-surface-700` base with a translucent gradient `after:` pseudo-element sweeping via `animate-skeleton-wave` | `skeleton.styles.ts:15,22-26` |
| No animation | Same base color, no shimmer | `skeleton.styles.ts:28` |
| Hover / Focus / Active / Disabled / Loading / Error | N/A — non-interactive placeholder, has no interactive or async states of its own (it *is* the "loading" signal) | — |

### Accessibility
- **Role/ARIA:** `aria-hidden="true"` unconditionally — intentionally invisible to assistive tech (`skeleton.component.ts:36`) — directly tested (`skeleton.component.spec.ts` — `'is aria-hidden unconditionally (decorative placeholder)'`).
- **Keyboard navigation:** N/A.
- **Screen reader:** Deliberately silent by design — see Description. If a "Loading" announcement is needed, pair with `ProgressSpinner` or a wrapping `role="status"` element, not expected from Skeleton itself. The design intent (silent placeholder, consumer owns the "Loading" announcement) is stated in the source comment (`skeleton.component.ts:8-15`) and the one behavior it implies — `aria-hidden` always being `"true"`, with no input to toggle it off — is exactly what the test above verifies; there is no code path where a consumer could accidentally expose the placeholder to assistive tech.

**A11y verdict:** Covered — the component's entire accessibility contract is "always `aria-hidden`, no exceptions," and that is directly and unconditionally tested.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use `size` for circular avatars (keeps width/height in sync automatically) | Don't expect Skeleton to announce loading state to screen readers — it's silent by design |
| Set explicit `width`/`height` matching the real content's dimensions | Don't try to force skeleton sizing through Tailwind utility classes — the component uses inline styles on purpose |

### Code example (Angular)
```html
<med-skeleton width="12rem" />
<med-skeleton width="8rem" height="0.75rem" />
<med-skeleton shape="circle" size="3rem" />
```
Source: `projects/showcase/src/app/app.html:840-843`

### Source
- `projects/medra/ui/src/lib/skeleton/skeleton.component.ts`
- `projects/medra/ui/src/lib/skeleton/skeleton.styles.ts`
