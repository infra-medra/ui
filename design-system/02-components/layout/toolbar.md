## Component: Toolbar

### Description
A header/action bar layout primitive with three named content-projection slots — `<div medToolbarStart>`, `<div medToolbarCenter>`, `<div medToolbarEnd>` (`projects/medra/ui/src/lib/toolbar/toolbar.component.ts:5-11`, `projects/medra/ui/src/lib/toolbar/toolbar.directives.ts`). `start`/`end` are equal `flex-1` siblings around `center` — the classic "holy grail" trick, so `center` sits at true visual center regardless of `start`/`end` width, with no JS measuring. The whole bar (and each slot individually) wraps on narrow viewports rather than overflowing. **Scope cut**: `role="toolbar"` is applied purely as a semantic grouping label — it does *not* implement the full WAI-ARIA APG "Toolbar" pattern's roving-tabindex arrow-key navigation between items, since projected content can be arbitrary (buttons, inputs, whole other components) and a generic roving-tabindex would have to special-case every possible focusable child (doc at `toolbar.component.ts:13-19`).

### Variants
No `variant`/`severity`/`size` inputs — a single visual treatment (bordered surface bar). The only "variant" axis is which slots are populated (all three, or just `start`+`end`).

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `ariaLabel` | `string \| null` | `null` | `aria-label` on the `role="toolbar"` element (`toolbar.component.ts:41`) |
| `class` | `string` | `''` | Extra classes on the toolbar bar (`toolbar.component.ts:42`) |

Projection slot marker directives (no inputs of their own): `medToolbarStart`, `medToolbarCenter`, `medToolbarEnd` (`toolbar.directives.ts:9-16`).

### States
N/A — Toolbar itself is a non-interactive layout container; interactivity belongs entirely to its projected children (buttons, inputs, etc.).

| State | Visual | Behavior |
|---|---|---|
| Default | `rounded-lg border border-surface-200 bg-surface-0` / dark: `border-surface-700 bg-surface-800` (`toolbar.component.ts:46`) | — |

### Accessibility
- **Role/ARIA:** `role="toolbar"`, `[attr.aria-label]="ariaLabel()"` (`toolbar.component.ts:27`) — both directly tested: `toolbar.component.spec.ts` — `'sets role="toolbar"'`, `'omits aria-label when none is provided'`, `'sets aria-label when provided'`.
- **Keyboard navigation:** None implemented at the Toolbar level — normal Tab order between projected items is relied on instead of roving tabindex (explicit, documented scope cut, `toolbar.component.ts:13-19`). **This is a deliberate deviation from the full WAI-ARIA APG "Toolbar" pattern**, which specifies that a `role="toolbar"` container should implement roving tabindex so Arrow keys (not Tab) move focus between items, with only one item in the Tab sequence at a time. MedraUi's Toolbar applies the `toolbar` role purely as a semantic grouping label without that keyboard behavior — a screen reader or keyboard user familiar with the ARIA pattern may expect Arrow-key navigation and not find it. `[not covered by tests]` for the same reason it isn't in source: it's an explicit scope cut, not an oversight, but it does mean the role's implied contract isn't fully met.
- **Screen reader:** `ariaLabel` names the toolbar region for assistive tech (e.g. `"Document actions"`) — directly tested (see above).

**A11y verdict:** Partial — role and `aria-label` are directly tested and correct, but applying `role="toolbar"` without its expected roving-tabindex Arrow-key navigation is a known, documented deviation from the full WAI-ARIA APG pattern, but it's still a gap relative to what the role implies to assistive technology.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Provide `ariaLabel` describing the toolbar's purpose | Expecting arrow-key navigation between toolbar items — not implemented, standard Tab order applies |
| Use only the slots you need (`start`+`end` alone is valid, `center` can be omitted) | Assuming `role="toolbar"` alone gives you the full WAI-ARIA APG Toolbar keyboard pattern — only the semantic grouping role is provided, not roving tabindex (`toolbar.component.ts:13-19`) |

### Code example (Angular)
```html
<med-toolbar ariaLabel="Document actions">
  <div medToolbarStart class="flex items-center gap-2">
    <button medButton type="button" variant="text" severity="secondary" iconOnly aria-label="Menu">
      <med-icon name="ellipsis-horizontal" variant="mini" />
    </button>
    <strong class="text-sm">invoice-042.pdf</strong>
  </div>
  <div medToolbarCenter>
    <input medInputText type="search" size="sm" placeholder="Search in document..." class="w-48" />
  </div>
  <div medToolbarEnd class="flex items-center gap-2">
    <button medButton type="button" variant="outlined" severity="secondary" size="sm">Share</button>
  </div>
</med-toolbar>
```
(from `projects/showcase/src/app/app.html:955-972`)

### Source
- `projects/medra/ui/src/lib/toolbar/toolbar.component.ts`
- `projects/medra/ui/src/lib/toolbar/toolbar.directives.ts`
