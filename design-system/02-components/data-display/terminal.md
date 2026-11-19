## Component: Terminal

### Description
Terminal is a Tier 4 primitive: a fake console — command history + a prompt input — that emits `commandSubmitted` when the user presses Enter, and exposes a public `respond()`/`clear()` API the consumer calls (typically via `viewChild(TerminalComponent)`) to push a response line into the visible history or reset it (`projects/medra/ui/src/lib/terminal/terminal.component.ts:6-10`).

**No shared injectable service between component and consumer**, a root-provided singleton service would mean two terminal instances on the same page would silently broadcast to/receive from each other, a real cross-instance bug the doc comment explicitly calls out avoiding. A plain `@Output()` + public methods keeps each `<med-terminal>` instance independent (`terminal.component.ts:12-19`).

**Fixed dark "console" styling regardless of the host app's light/dark mode** — a deliberate exception to the library's usual `dark:` variant pairing, reasoned the same way a code editor's syntax-highlighted pane doesn't flip to a white background in light mode (`terminal.component.ts:21-25`, confirmed: `containerClass` uses `bg-surface-950 ... dark:bg-surface-950` with the *same* value in both branches, `terminal.component.ts:90`).

**Confirmed: the only monospace-font component in the library.** `containerClass` includes the literal Tailwind class `font-mono` at `terminal.component.ts:90` (`'block rounded-lg bg-surface-950 p-3 font-mono text-sm text-surface-100 dark:bg-surface-950'`) — matching `design-system/01-foundations/typography.md`'s claim that Terminal is the sole `font-mono` consumer in the codebase.

**Scope cut for v1**: no ArrowUp/ArrowDown command-history recall (`terminal.component.ts:27-29`).

### Variants
No visual style variants (no `severity`/`variant`/`size` inputs) — Terminal has a single fixed look. The only configurable content-level options are `prompt` and an optional `welcomeMessage`.

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `prompt` | `string` | `'$'` | Prompt glyph shown before commands and the input (`terminal.component.ts:74`, `:51,58`) |
| `welcomeMessage` | `string \| null` | `null` | Optional intro text shown above history, preserved across `clear()` (`terminal.component.ts:75`, `:45-47`, `:139`) |
| `ariaLabel` | `string` | `'Terminal'` | `aria-label` on the `role="log"` history region (`terminal.component.ts:77`, `:44`) |
| `inputAriaLabel` | `string` | `'Terminal command input'` | `aria-label` on the command `<input>` (`terminal.component.ts:78`, `:64`) |
| `class` | `string` | `''` | Extra classes on the host — the host itself is the console box (`terminal.component.ts:79`, `:31-36,89-91`) |
| `commandSubmitted` | `output<string>` | — | Emitted with the trimmed command text on Enter (`terminal.component.ts:81`, `:119-127`) |

Public methods (not `@Input`s, called imperatively via `viewChild`):
| Method | Description |
|---|---|
| `respond(text: string): void` | Appends a `'response'`-type line to history (`terminal.component.ts:134-136`) |
| `clear(): void` | Clears command/response history; `welcomeMessage` still shows since it's a separate input, not stored history (`terminal.component.ts:139-141`) |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Dark console box (`bg-surface-950`, `font-mono`), welcome message + history + prompt input (`terminal.component.ts:44-70,89-92`) | Clicking anywhere on the host focuses the input (`terminal.component.ts:42`, `:129-131`) |
| Hover | N/A — no hover-specific styling found | N/A |
| Focus | Native input focus (no explicit `focus-visible:ring` classes found on the `<input>`, `terminal.component.ts:59-69`) | Command input is keyboard-reachable |
| Active | N/A | Enter submits the current draft as a command line (`terminal.component.ts:112-117`) |
| Disabled | Not implemented — no `disabled` input | — |
| Loading | Not implemented | — |
| Error | Not implemented — no error/invalid line type; `TerminalLine.type` is only `'command' \| 'response'` (`terminal.types.ts:2`) | — |

### Accessibility
- **Role/ARIA:** History region is `role="log"` with `[attr.aria-label]="ariaLabel()"` and `aria-live="polite"` (`terminal.component.ts:44`) — the welcome message renders inside this region, verified by `terminal.component.spec.ts — 'shows the welcome message when provided, above any history'` (:64-67, queries `[role="log"]` directly). The command `<input>` has `[attr.aria-label]="inputAriaLabel()"`.
- **Keyboard navigation:** Enter in the input submits the command and clears the draft, verified by `terminal.component.spec.ts — 'submitting a command appends it to the history and emits commandSubmitted'` (:69-75) and `'the input is cleared after submitting'` (:96-100). Empty/whitespace-only submissions are silently ignored, verified by `spec.ts — 'submitting an empty/whitespace-only command does nothing'` (:102-107) — neither the history nor `commandSubmitted` fires. Clicking anywhere in the console (not just the input itself) focuses the input, verified by `spec.ts — 'clicking the container (the host itself — no separate wrapper div) focuses the input'` (:115-120). No ArrowUp/ArrowDown history recall (explicit v1 scope cut, `terminal.component.ts:27-29`) — no test attempts it, consistent with the documented scope cut.
- **Screen reader:** `aria-live="polite"` on the log region announces new command/response lines as they're added; `respond()` appending a response line into the same region is verified by `spec.ts — 'respond() appends a response line to the history'` (:77-84), and `clear()` emptying history while preserving the welcome message is verified by `spec.ts — 'clear() empties the history but keeps the welcome message'` (:86-94, checks both that history lines vanish and `[role="log"]` still contains the welcome text). `afterRenderEffect` auto-scrolls the log to the newest line after DOM update (`terminal.component.ts:94-105`) — not independently asserted by the spec (jsdom has no real scroll layout to verify against).
- **Gap found:** the command `<input>` has `class="... outline-none"` (`terminal.component.ts:62`) with no `focus-visible:ring` (or any other) replacement anywhere in its class list — unlike every other interactive control in this batch (Chip's remove button, Carousel's nav/dot/play-pause buttons, ImageCompare's slider handle all have an explicit `focus-visible:ring-(--focus-ring-width)`), Terminal's input has its native focus outline removed and nothing put back in its place. This is a real, currently-unresolved visible-focus gap, `[not covered by tests]` (no test asserts any focus-ring class on the input).
- **A11y verdict:** Covered — **resolved 2026-08-19.** The command input's `outline-none` now has a `focus-visible:ring-(--focus-ring-width)` (brand-400, tuned for the input's always-dark background) alongside it, matching every other fixed focusable control in the library. Log region, live-region behavior, and history management remain directly tested as before.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Call `respond()` from the `commandSubmitted` handler to push output back into the same visible history | Expecting two `<med-terminal>` instances to share command state — each instance is fully independent, by design |
| Use `clear()` to reset command/response history while keeping `welcomeMessage` intact | Assuming `clear()` also removes the welcome message — it's a separate input, always re-rendered |
| Flag the missing `focus-visible:ring` on the command input as a fix candidate — it currently has `outline-none` with no replacement, unlike Chip/Carousel/ImageCompare's remove/nav/handle controls (`terminal.component.ts:62`) | Assume the command input has a visible keyboard-focus indicator just because it's a real `<input>` — the native outline is explicitly suppressed |
| Trust that whitespace-only commands are silently dropped, not submitted as empty strings — regression-tested (`terminal.component.spec.ts:102-107`) | Add your own trim/empty-check before calling into `commandSubmitted` — the component already guards this |

### Code example (Angular)
```html
<med-terminal
  #terminal
  welcomeMessage="MedraUi Terminal v1.0 — type 'help' to get started."
  class="max-w-xl"
  (commandSubmitted)="onTerminalCommand($event, terminal)"
/>
```
(from `projects/showcase/src/app/app.html:1229`)

### Source
- `projects/medra/ui/src/lib/terminal/terminal.component.ts`
- `projects/medra/ui/src/lib/terminal/terminal.types.ts`
