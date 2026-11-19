## Component: Tag

### Description
Tag is a Tier 1 primitive: a small solid status label (`projects/medra/ui/src/lib/tag/tag.component.ts:6`). It reuses Button's own filled/severity color classes (`FILLED_SEVERITY_CLASSES`) — the same solid look as a filled Button, just rendered on a non-interactive `<span>` instead of a `<button>` (`tag.component.ts:6-8`). Content is projected via `<ng-content />`.

### Variants
| Variant | When to use |
|---|---|
| Square-ish (default, `pill=false`) | `rounded-md` corners (`tag.component.ts:24-25`) |
| `pill` | Fully rounded (`rounded-full`) corners (`tag.component.ts:19`, `:25`) |
| `severity` (`'primary' \| 'secondary' \| 'info' \| 'success' \| 'warn' \| 'help' \| 'danger' \| 'contrast'`) | Semantic color per Button's severity vocabulary (`tag.component.ts:18`, `:3`) |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `severity` | `ButtonSeverity` | `'primary'` | Color, via `FILLED_SEVERITY_CLASSES` (`tag.component.ts:18`, `:26`) |
| `pill` | `boolean` | `false` | Fully rounded corners (`tag.component.ts:19`) |
| `class` | `string` | `''` | Extra classes merged onto the inner `<span>` (`tag.component.ts:20`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Solid severity-colored label | — |
| Hover | N/A — static, non-interactive `<span>`; `FILLED_SEVERITY_CLASSES` includes `hover:`/`active:` utility classes (inherited from Button's palette) but Tag has no pointer/keyboard handlers, so they never trigger in practice | N/A |
| Focus | N/A — not focusable | N/A |
| Active | N/A | N/A |
| Disabled | N/A — no `disabled` input | N/A |
| Loading | Not implemented | — |
| Error | N/A | — |

### Accessibility
- **Role/ARIA:** None found — no `role` or `aria-*` attributes in the template (`tag.component.ts:15`). Unlike Badge, this is not a gap: Tag always requires projected text content (there is no contentless `dot`-style variant), verified by `tag.component.spec.ts — 'renders the projected content'` (:25-28), so a plain `<span>` with real text is sufficient for assistive tech without any extra ARIA.
- **Keyboard navigation:** None found — not an interactive element; no keyboard tests in the spec, consistent with a static label.
- **Screen reader:** Relies entirely on projected text content; no `aria-label` wiring needed since (unlike Badge) Tag has no contentless mode — `severity` and `pill` only affect color/shape classes (`tag.component.spec.ts:30-50`), never the presence of text.
- **A11y verdict:** Covered — Tag's only accessible-name mechanism is its required projected text, and the spec confirms that text always renders regardless of `severity`/`pill`; there is no contentless variant (unlike Badge's `dot`) that could leave it unlabeled.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Use Tag for a static status label and Badge for a count/dot indicator — they share the same severity palette but different shapes/purposes | Using Tag where interactivity is needed — it renders a non-interactive `<span>`, not a button |
| Always project real text into Tag (e.g. `<med-tag severity="success">Active</med-tag>`) since that text is its only accessible name | Using Tag purely as a colored decoration with no meaningful text — unlike Badge it has no `dot` escape hatch, so empty content means an empty accessible name too |

### Code example (Angular)
```html
<med-tag severity="success">Active</med-tag>
<med-tag severity="danger">Failed</med-tag>
<med-tag severity="info" pill>New</med-tag>
```
(from `projects/showcase/src/app/app.html:666-668`)

### Source
- `projects/medra/ui/src/lib/tag/tag.component.ts`
