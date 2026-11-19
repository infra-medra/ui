## Component: Editor

### Description
`EditorComponent` (`med-editor`) is a minimal rich text editor — a native `contenteditable` region plus a formatting toolbar. Value is an HTML string, via `ControlValueAccessor`. It's built on `document.execCommand`/`queryCommandState`, not a third-party rich-text engine — both APIs are formally deprecated but every major browser still ships them, and there's no standardized replacement yet (`projects/medra/ui/src/lib/editor/editor.component.ts:15-24`).

**Sanitized on every write, both directions**: `writeValue` (an external/programmatic value) and the `(input)` handler (the user's own typing/pasting) both run the HTML through Angular's `DomSanitizer` before it ever becomes the model value or gets written back into the DOM — pasted content in particular can carry `<script>`, inline event handler attributes, or `javascript:` URLs (`editor.component.ts:26-34`). `bypassSecurityTrustHtml` is never used.

**Toolbar scope for v1**: Bold/Italic/Underline, bullet/numbered lists, undo/redo — the commands with reliable cross-browser `execCommand`/`queryCommandState` behavior. No headings, link insertion, text color, or font size (`editor.component.ts:36-43`). Active-state tracking (pressed look) only covers Bold/Italic/Underline — `queryCommandState` for the list commands is unreliable across browsers (`editor.component.ts:45-49`).

### Variants
Not applicable — no variant inputs (no `size`, no `severity`). A single fixed layout: toolbar + content area.

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | `editor.component.ts:114` |
| `placeholder` | `string` | `''` | Shown via `empty:before:content-[attr(data-placeholder)]` — `editor.component.ts:115` |
| `ariaLabel` | `string` | `'Rich text editor'` | `editor.component.ts:117` |
| `toolbarLabel` | `string` | `'Text formatting'` | `editor.component.ts:118` |
| `boldLabel` / `italicLabel` / `underlineLabel` | `string` | `'Bold'` / `'Italic'` / `'Underline'` | `editor.component.ts:119-121` |
| `bulletListLabel` / `numberedListLabel` | `string` | `'Bullet list'` / `'Numbered list'` | `editor.component.ts:122-123` |
| `undoLabel` / `redoLabel` | `string` | `'Undo'` / `'Redo'` | `editor.component.ts:124-125` |
| `class` | `string` | `''` | `editor.component.ts:126` |

**No `invalid` input exists** — Editor has no error/validation-state affordance at all (see Issues below).

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Bordered container: `overflow-hidden rounded-lg border border-surface-200` — `editor.component.ts:141` | — |
| Focus | Native `contenteditable` focus ring (`focus-visible:outline-none` on the content area, no custom ring class found — `editor.component.ts:103`) | |
| Active (toolbar button pressed) | `bg-surface-200` applied via `toolbarButtonClass()` for Bold/Italic/Underline only — `editor.component.ts:157-159` | `aria-pressed` reflects the same three states — `editor.component.ts:66,69,72` |
| Disabled | `[attr.contenteditable]` set to `'false'`, toolbar buttons get native `[disabled]` — `editor.component.ts:101,66-92` | `exec()` no-ops when disabled — `editor.component.ts:161-164` |
| Loading | Not implemented | |
| Error | **Not implemented** — no `invalid` input, no danger border/ring, no `aria-invalid` found anywhere in the component | |

### Accessibility
- **Role/ARIA:** Toolbar: `role="toolbar"`, `aria-label` (`toolbarLabel`) — `editor.component.ts:65`. Content area: `role="textbox"`, `aria-multiline="true"`, `aria-label` (`ariaLabel`), `aria-disabled` — `editor.component.ts:97-101` — the `role="textbox"`/`contenteditable="true"` wiring is spec-verified: `editor.component.spec.ts:39-43 — 'renders an empty editable region by default'`. Each toolbar button has its own `aria-label`; Bold/Italic/Underline additionally set `aria-pressed`, spec-verified to actually reflect live formatting state (not just present-but-static): `editor.component.spec.ts:81-90 — 'reflects the active formatting state via aria-pressed after a command runs'`, which confirms Bold's `aria-pressed` flips to `'true'` while Italic's stays `'false'`.
- **Keyboard navigation:** Relies on native `contenteditable` keyboard behavior (typing, native selection) for the content area. **Toolbar roving tabindex — resolved 2026-08-19:** the toolbar's `role="toolbar"` now implements the ARIA APG roving-tabindex pattern it was already implying — one button is the toolbar's single Tab stop at a time (`rovingIndex()`, defaulting to Bold), `ArrowRight`/`ArrowLeft` move (and wrap) between all 7 buttons, `Home`/`End` jump to Bold/Redo (`editor.component.ts:180-208`). Unlike `DockComponent`'s per-item disabled state, every toolbar button here shares one `isDisabled()` flag, so the roving cycle needs no enabled-index filtering — it's a plain wrap-around over all 7. Confirmed by `editor.component.spec.ts` — `'only the first button (Bold) is in the Tab order initially, the rest are -1'`, `'ArrowRight moves the roving tab stop to (and focuses) the next button, wrapping past the last one'`, `'ArrowLeft from the first button wraps around to the last'`, `'Home/End jump the roving tab stop to the first/last button'`. No `Ctrl+B`/`Ctrl+I`/`Ctrl+Z` keyboard shortcuts exist or are tested — all command activation is via a toolbar button (click, or now Enter/Space via roving focus).
- **Screen reader:** `role="textbox"` + `aria-multiline="true"` + `aria-label` on the content area is the primary screen-reader surface; toolbar buttons are individually labeled. **No `aria-live` region added, by design:** the one piece of toolbar state that actually changes as a result of a command — Bold/Italic/Underline's pressed look — is already exposed natively via `aria-pressed` (screen readers announce a toggle button's own pressed-state change without needing a separate live region to echo it); list/undo/redo commands have no persistent state to announce at all. A live-region announcement for arbitrary content edits (e.g. "text changed") was considered and rejected as noise — a `contenteditable` region's own native input-event behavior already gives assistive tech what it needs as the user types, the same way it would for any other text input.
- **Sanitization:** confirmed to run on the user-typing/pasting path, not just `writeValue` — `editor.component.spec.ts:62-72 — 'strips a <script> tag out of typed/pasted HTML before it reaches onChange'` asserts a `<script>` tag is stripped from the committed value while sibling content (`<p>Hi</p>`) survives intact.
- **Disabled:** sets real `contenteditable="false"` on the content region and native `[disabled]` on every toolbar button, and a click on a disabled toolbar button is confirmed not to invoke `execCommand` at all — `editor.component.spec.ts:92-99, 108-117`.
- **A11y verdict:** Covered — **resolved 2026-08-19**: `role`/`aria-*` wiring, live `aria-pressed` state, disabled propagation, paste-time sanitization, and now the toolbar's roving-tabindex Arrow/Home/End navigation are all directly spec-verified. The lack of an `aria-live` region is a deliberate, documented decision (see Screen reader above), not an unaddressed gap.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Trust the component's own sanitization — never call `bypassSecurityTrustHtml` on values passed to/from it (spec-verified: a pasted `<script>` tag is stripped before `onChange`) | Don't expect an `invalid`/error state — none exists; build your own error messaging around the component if needed |
| Keep expectations to the fixed v1 toolbar (bold/italic/underline, lists, undo/redo) | Don't expect headings, links, or text color — out of scope for v1 |
| Rely on `aria-pressed` to reflect true live formatting state at the caret (spec-verified) | Don't expect every toolbar button to be individually Tab-reachable — the toolbar uses roving tabindex (**resolved 2026-08-19**), so Tab lands on one button and Arrow/Home/End move between the rest |
| Trust the toolbar's `role="toolbar"` to behave like the real APG pattern now — one Tab stop, Arrow/Home/End roving focus, spec-verified | Don't expect an `aria-live` announcement for arbitrary content edits — a deliberate scope decision, not a gap (see Accessibility) |

### Code example (Angular)
```html
<med-editor [(ngModel)]="editorValue" placeholder="Write something..." class="max-w-xl" />
```
Source: `projects/showcase/src/app/app.html:1354`

### Source
- `projects/medra/ui/src/lib/editor/editor.component.ts`
