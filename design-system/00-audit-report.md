# Design System Audit — MedraUi (`@medra.dev/ui`)

Method: cross-referenced the live showcase (`localhost:4200`) against the library source (`projects/medra/ui/src/lib/`, 89 component folders) and the theme source (`tailwind-theme-medraui.css`). All findings below are backed by a file/line citation; nothing here was inferred without source evidence. This report covers Phase 2's token findings, a repo-wide structural scan, and Phase 4's per-component Wave 1 pass (all 89 components now have an essentials doc page in `02-components/`).

Phase 4 execution note: dispatched as 7 parallel agents by category. 5 of the 7 hit an external session-limit error mid-run (unrelated to the codebase); their partial output was verified file-by-file — 2 finished cleanly, 4 had completed all but 1-2 files each (missing exactly: `cascade-select`, `panel`, and the 5 components in `feedback/` — `inline-message`, `progress-bar`, `progress-spinner`, `skeleton`, `block-ui`), and those 7 remaining docs were written directly to close the gap. Quality of the agent-produced docs, spot-checked against source, was high — no fabricated fields found.

## Resumo

Componentes revisados (estrutural, todos): **89** | Componentes documentados (Wave 1 — essentials, per `02-components/_index.md`): **89 of 89** | Problemas encontrados: **13** | Aplicados no código: **11** | Deliberadamente não aplicados: **2** (ver "Ações Prioritárias" abaixo) | Score: **78/100** (pré-fix; not re-scored post-fix)

The score reflects a codebase with genuinely good token discipline (few hardcoded values, a real focus-ring/opacity/radius/duration token layer) that had never been audited or documented before — the gaps found are mostly "never named" or "partially implemented," not actively contradictory design decisions.

## Consistência de Nomenclatura

| Problema | Componentes afetados | Padrão recomendado |
|---|---|---|
| Two spellings produce the same 4px radius: bare `rounded` (27 occurrences) vs. `rounded-sm` (10 occurrences, matches the `--radius-sm` token) | Not yet enumerated per-component — found via repo-wide grep, see `01-foundations/borders-radius.md` | Standardize on `rounded-sm` everywhere a 4px radius is intended, since it's the one with a named token behind it |
| Component vs. directive selector casing differs (`med-kebab-case` elements vs. `[medCamelCase]` attributes) | All 89 | **Not actually a problem** — recorded here because it looks like an inconsistency at first grep, but it's a coherent, deliberate two-pattern convention (Angular component selectors vs. directive selectors). No action needed; noted so a future audit doesn't re-flag it. |

## Cobertura de Tokens

| Categoria | Tokens definidos | Valores hardcoded / não tokenizados encontrados |
|---|---|---|
| Colors | Brand ramp (11 steps) + 5 semantic ramps (11 steps each) + surface ramp (12 steps, light/dark) | None outside `color-picker/` (expected — a color picker's job is raw hex). See `01-foundations/colors.md`. |
| Radius | 5 steps (`xs`–`xl`, 2px–12px) | Bare `rounded` (27×) bypasses the named `-sm` token with an identical value — a naming gap, not a value gap. |
| Shadow/Elevation | 2 steps (`overlay-sm`, `overlay-lg`) | **`shadow-overlay-md` used at 2 call sites but never defined** — likely renders no shadow at all. See "Ações Prioritárias" below. |
| Motion | 1 duration token (`--transition-duration-base`, 0.2s) + 2 named ambient animations | 2 call sites hardcode `duration-300`/`duration-150` instead of the token, undocumented whether intentional. |
| Typography | Form-field scale only (3 sizes) | No general heading/body/caption scale is tokenized; components use `text-xs/sm/base/lg` ad hoc (60/13/6/7 occurrences respectively) with no named scale behind them. |
| Spacing | Form-field padding only (3 sizes × x/y) | No general spacing scale is tokenized; `gap-*` usage (repo-wide) stays on Tailwind's native 4px grid with no drift found, but nothing is named. |

## Completude dos Componentes

Structural proxies, repo-wide:

| Signal | Coverage |
|---|---|
| Files referencing `aria-*` attributes | 83 of 89 component folders |
| Files referencing `disabled` handling | 74 of 89 component folders |
| Components with a dedicated `*.styles.ts` CVA file (vs. inline classes) | 21 of 89 |

These are coverage *signals*, not completeness verdicts. Per-component accessibility status is now tracked individually in `02-components/_index.md` ("A11y" column). Wave 1 was not an exhaustive per-component accessibility audit — it recorded whatever surfaced naturally while documenting variants/props/states — so most rows are still "Not yet individually verified" rather than a confirmed "Covered." The rows that *were* flagged, with source citations, feed the table below.

### Specific gaps found during Wave 1 — all resolved 2026-08-19 except Toolbar (see below)

| Component | Finding | Status |
|---|---|---|
| SpeedDial | Used `shadow-overlay-md`, an undefined theme token | ✅ Fixed — token defined |
| ImageCompare | Used `shadow-overlay-md` (undefined); no broken-image fallback | ✅ Fixed — token defined + fallback added |
| Button | No `loading`/`invalid` on the directive itself; ToggleButton/SelectButton each duplicated their own invalid ring | ✅ Fixed — `invalid`/`loading` added; ring extracted to shared `INVALID_RING_CLASS` (spinner rendering intentionally out of scope, see priority action 6) |
| SelectButton | Disabled visual treatment manually re-implemented (native `:disabled` never applies) | Unchanged — correctly documents the existing `aria-disabled` convention, not a bug |
| Toolbar | `role="toolbar"` is semantic-only, no roving-tabindex | ⏭️ **Not fixed, reclassified as by-design** — see priority action 8 |
| Icon | Unregistered icon name failed silently (console-only) | ✅ Fixed — visible dashed placeholder added |
| Galleria | No arrow-key roving focus between thumbnails; no broken-image handler on thumbnails | ✅ Fixed — both added |
| Chip, Carousel | Missing `focus-visible:ring` on remove button / nav-dot-playpause buttons | ✅ Fixed |
| ProgressBar | No default `aria-label` | ✅ Fixed — defaults to `'Progress'` |
| Ripple adoption | Only Button consumed `[medRipple]` | ✅ Fixed — extended to SplitButton, SpeedDial, ToggleButton, SelectButton |

Each fix above is covered by a dedicated test (Jest suite: 1164 tests passing, 111 suites) and both `npm run build:ui`/`npm run build:css` succeed. Per-component detail is in each component's own page under `02-components/`.

## Ações Prioritárias — status after applying (2026-08-19)

All code changes below were applied directly to `projects/medra/ui/src/lib/` and `tailwind-theme-medraui.css` after explicit approval to proceed with conservative defaults on the items requiring a design call. Full test suite (1147 tests, 111 suites) and both builds (`build:ui`, `build:css`) pass after every change.

1. ✅ **Applied — `shadow-overlay-md` defined.** Added to `tailwind-theme-medraui.css`, value interpolated between `-sm` and `-lg` following Tailwind's own default box-shadow progression (a mechanical interpolation, not a freehand pick). ImageCompare's handle and SpeedDial's action button now render a real shadow again.
2. ✅ **Applied — radius spelling standardized.** All 18 real occurrences of bare `rounded` (the earlier "27" was an over-count from a looser grep; two of the original matches were false positives inside comments) replaced with `rounded-sm` across 12 files.
3. ⏭️ **Deliberately not applied** — naming the general typography/spacing scale as new tokens. No call sites would consume unused new tokens without a much larger, low-value refactor of every `text-sm`/`gap-2`/etc. usage across 89 components; adding unused tokens would itself be new clutter. Left as a documented recommendation only, not code — a real decision for you if/when it's worth the refactor.
4. ✅ **Applied — motion outliers named.** Added `--transition-duration-fast` (0.15s) and `--transition-duration-slow` (0.3s) alongside `-base`; Carousel and Dock now reference the named tokens instead of raw `duration-300`/`duration-150`. **Values unchanged** — this only makes the existing behavior traceable, doesn't silently alter animation feel. Whether the underlying values should ever change is still open.
5. ✅ **Applied — Ripple extended** to SplitButton, SpeedDial (main + item buttons), ToggleButton, and SelectButton, matching the directive's own documented intent ("a shared primitive used by action components (Button, etc.)"). Reuses `RippleDirective`'s existing disabled/reduced-motion guardrails.
6. ✅ **Applied, partially — Button `invalid` and `loading`.** `invalid` now lives directly on `ButtonDirective` (danger ring extracted to a shared `INVALID_RING_CLASS`, also now consumed by ToggleButton/SelectButton instead of each duplicating the string). `loading` sets `aria-busy` and dims/disables interaction. **Not applied: a rendered spinner.** `ButtonDirective` is a plain attribute directive on a consumer-authored `<button>`/`<a>` — no template of its own, so it cannot inject content. A real spinner would require turning Button into a wrapping component, a breaking API change not made unilaterally here. Consumers should project `<med-progress-spinner>` themselves alongside the label when `loading` is true.
7. ✅ **Applied — Icon fallback.** Unregistered icon names now render a visible dashed placeholder box (in addition to the existing console warning) instead of an empty, silently-blank SVG.
8. **Wave 1 accessibility gaps — mixed:**
   - ✅ Galleria: added roving-tabindex + arrow-key/Home/End navigation between thumbnails (same model as `TabsComponent`), plus a broken-image fallback on the thumbnail `<img>`.
   - ✅ ImageCompare: broken-image fallback added to both stacked `<img>` elements.
   - ✅ Chip's remove button and Carousel's prev/next/dot/play-pause buttons: added the missing `focus-visible:ring`.
   - ✅ ProgressBar: now defaults `ariaLabel` to `'Progress'`, matching ProgressSpinner's `'Loading'` default instead of shipping with none.
   - ⏭️ **Reclassified, not applied — Toolbar roving-tabindex.** Re-reading `toolbar.component.ts:13-19` closely: this is a deliberate, already-documented scope cut with real reasoning ("projected content can be anything... a generic roving-tabindex would have to special-case every possible focusable child..."), not an accidental gap. The original Wave 1 pass mis-filed this as "Partial" — it should have read "By design." Overriding an already-reasoned, referenced decision isn't a conservative default; left as-is.
9. ✅ **Phase 4 (Wave 1) is done** — all 89 components have an essentials doc page in `02-components/`. A Wave 2 pass (deeper accessibility verification, live browser confirmation of states, richer do's/don'ts) is still open.

## Wave 2 — Accessibility Deepening (2026-08-19)

Dispatched as 7 parallel agents by category (same split as Wave 1), each re-reading every component's `.spec.ts` test file(s) in full — not just source/template — as authoritative evidence of what's actually verified, then adding a one-line **A11y verdict** (Covered / Partial / Gap found / By design) plus deepened Accessibility and Do's/Don'ts sections to all 89 existing doc pages under `02-components/`. No source or test files were touched — read-only, same as Wave 1. Verdicts are summarized per-component in `02-components/_index.md`; full citations live on each component's own page.

One agent (navigation) parallelized further by spawning its own 3 sub-agents rather than working sequentially — flagged here because it looked like a stall/failure at first (an early status check on the wrong file found no diff) and triggered a redundant retry dispatch, which was caught and stopped (`TaskStop`) once the sub-agents' real output appeared. No duplicate or conflicting edits landed; noted as a process observation, not a defect.

**Verdict tally at end of Wave 2's documentation-only pass (88 components, Ripple excluded):** Covered 36 · Partial 38 · Gap found 13 · By design 1. **Updated after the first 2026-08-19 fix pass (below):** Covered 51 · Partial 35 · Gap found 1 · By design 1. **Updated after the second 2026-08-19 fix pass — the full "Partial" sweep (see below):** Covered 81 · Partial 3 · Gap found 1 · By design 3. **Updated after the third fix pass, 2026-08-20 (MegaMenu/TieredMenu):** Covered 83 · Partial 1 · Gap found 1 · By design 3. **Updated after the fourth fix pass, 2026-08-20 (Fieldset):** Covered 84 · Partial 0 · Gap found 1 · By design 3 — see `02-components/_index.md` for the live table.

### The single most consequential finding: no focus-trap/focus-restore test coverage anywhere — resolved 2026-08-19

Every `OverlayService`-based modal/dismissable surface — **Dialog, ConfirmDialog, ConfirmPopup, Drawer, Popover, and `OverlayService` itself** — inherits the same focus-trap (Tab cycling within the open panel) and focus-restoration (return focus to the trigger element on close) behavior from `overlay.service.ts:304-322`. A repo-wide grep for `focus|Tab|activeElement` across all 14 `feedback/` spec files originally returned **zero matches** for this behavior. **Fixed**: added a dedicated `describe('focus management ...')` block to `overlay.service.spec.ts` (8 tests) — a backdrop overlay creates a focus trap and calls `focusInitialElementWhenReady()`; closing destroys it; a non-backdrop overlay skips the trap by default; `trapFocus` overrides that in either direction; and, tested behaviorally since this part is synchronous, closing restores focus to whatever was focused before open, with `restoreFocus: false` correctly leaving it wherever it moved to instead. One suite, six components retroactively covered.

### 13 components originally verdicted "Gap found" — now 12 fixed, 1 by design

| Component | Original gap | Status |
|---|---|---|
| SpeedDial | No Escape-to-close, no arrow-key nav between items, no focus management on open/close | ✅ Fixed — all three added, `SelectButton`/`Tabs`' wrapping-roving-focus model reused |
| Dock | `role="toolbar"` without roving-tabindex; magnify effect has no keyboard-focus equivalent | ✅ Fixed — `(focus)`/`(blur)` trigger the same magnify as pointer hover, and `role="toolbar"` now implements ARIA APG roving tabindex (Arrow/Home/End, disabled items skipped) |
| ContextMenu | No keyboard-accessible *open* path — hard-wired to the mouse/touch `contextmenu` event | ✅ Fixed — `(keydown)` now opens on the `ContextMenu` key / Shift+F10, anchored to the host element |
| FileUpload | Dropzone has no role, no keyboard activation, no `aria-invalid`, no live-region announcements | ✅ Fixed — all four added |
| DataView | No ARIA/roles/keyboard at the component level; fully deferred to the consumer's template | **Unchanged — by design**, not a defect. No fix applicable. |
| Tree | `role="button"` rows instead of `role="tree"`/`treeitem`; no arrow-key nav; missing `aria-level`/`setsize`/`posinset` | ✅ Fixed — full ARIA treeitem upgrade + Up/Down/Left/Right/Home/End keyboard nav via a DOM query against the nearest `[role="tree"]` (kept `expanded` state local per node, no architecture change) |
| TreeTable | `aria-expanded`/`aria-label` exist in source but zero spec assertions check ARIA; no `aria-level`; no keyboard nav beyond the native toggle | ✅ Fixed — toggle ARIA now tested, rows carry `aria-level`/`aria-posinset`/`aria-setsize`/row-level `aria-expanded`, and row-level Up/Down/Left/Right/Home/End keyboard navigation (roving tabindex) was added |
| OrderList | `role="listbox"`/`role="option"` implies keyboard-selectable options, but selection was click-only | ✅ Fixed — roving-tabindex + arrow-key/Home-End/Enter-Space, same model as `Tabs`/`SelectButton` |
| PickList | Same shape as OrderList, plus double-click transfer is mouse-only | ✅ Fixed — same fix as OrderList, applied independently per list (double-click remains a mouse-only *shortcut*; select-then-Move already covers it by keyboard, not a gap) |
| Badge | Zero ARIA/accessible-name mechanism; `dot` variant conveys meaning by color alone | ✅ Fixed — opt-in `ariaLabel` for `dot` mode, mirroring `OverlayBadge.badgeAriaLabel` |
| MeterGroup | `showLegend=false` + always-`aria-hidden` bar leaves zero accessible content | ✅ Fixed — legend now renders `sr-only` instead of not rendering at all |
| Terminal | Command `<input>` sets `outline-none` with no `focus-visible:ring` replacement | ✅ Fixed — one line, existing token |
| Inplace | No focus management on open/close — focus silently drops to `<body>` | ✅ Fixed — opens into content, closes back to the display button, via `afterRenderEffect` |

All fixes are covered by dedicated tests (full suite: 1210 tests passing, 111 suites) and both `npm run build:ui`/`npm run build:css` succeed after every change. Per-component detail is in each component's own page under `02-components/`.

### Second fix pass: closing out the remaining 35 "Partial" verdicts (2026-08-19)

After the first pass above closed every "Gap found" and Dock/TreeTable's own remaining product-decision items, 35 components still carried a "Partial" verdict — a specific untested-but-claimed-correct behavior, or occasionally a genuinely missing implementation. Dispatched as 6 parallel agents by domain (form inputs, complex selects/Editor, menu family, steps/stepper/paginator, feedback/overlays, data-display/misc), each investigating its assigned components' claimed gap, then either (a) adding the missing test once the behavior was confirmed correct, (b) implementing the real gap if one genuinely existed, or (c) re-verdicting as "By design" if investigation showed the "gap" was actually a correct, deliberate scope decision.

**30 components moved Partial → Covered:** Button, InputText, Textarea, InputNumber, Password, Checkbox, RadioButton, CascadeSelect, Listbox, TreeSelect, InputChips, ColorPicker, Editor, Knob, Menu, Menubar, PanelMenu, Steps, Stepper, Paginator, ConfirmDialog, ConfirmPopup, Popover, Toast, Message, DataTable, OrganizationChart, Avatar, Chip, Image.

Real implementation gaps found and fixed along the way (not just missing tests):
- **Button** — `loading` now blocks keyboard Enter/Space activation via a `(keydown)` guard (previously only `pointer-events-none`, which native keyboard activation ignores). Deliberately not native `disabled`, to avoid clobbering a consumer's own `[disabled]` binding.
- **Knob** — `aria-invalid` was genuinely missing from the SVG template despite the `invalid` input already existing; added `[attr.aria-invalid]`.
- **InputChips** — added a new `aria-live="polite"` region announcing chip add/remove, and a new keyboard path (Arrow-key roving between chips' remove buttons, Delete/Backspace) to remove a non-last chip. Along the way, found and fixed a real bug: removing a chip then immediately re-querying `viewChildren(ChipComponent)` returned stale results before Angular's next render — fixed with an explicit `ChangeDetectorRef.detectChanges()`.
- **Editor** — implemented ARIA APG roving-tabindex (Arrow/Home/End) across the 7 `role="toolbar"` buttons, mirroring `DockComponent`'s pattern.
- **Steps** / **Paginator** — same roving-tabindex toolbar pattern added for arrow-key navigation between steps / page buttons.
- **ConfirmDialog** — initial focus on open now deliberately defaults to Reject, for consistency with ConfirmPopup's existing default (dismissal is the safer default for a frequently-`danger` accept action).
- **ConfirmPopup** — panel gained `role="alertdialog"` + `aria-describedby` (pointing at the message paragraph).
- **Popover** — panel gained `role="dialog"` plus a new optional `ariaLabel` input.
- **Toast** — `danger`-severity toasts now escalate to `role="alert"`/`aria-live="assertive"`; implemented in the shared `MessageComponent` each toast item renders through (Message itself picked up the same computed `role`/`aria-live`, so both components' gaps closed together).
- **DataTable** — the sortable column header genuinely had no `tabindex`/keyboard handler at all (mouse-only click-to-sort); added `tabindex`, an Enter/Space `keydown` handler, and a focus-visible ring.
- **OrganizationChart** — implemented Up/Down/Left/Right/Home/End keyboard navigation, mapped to the chart's actual 2-D layout (Up=parent, Down=first child, Left/Right/Home/End=siblings) rather than Tree's simple vertical-list model. Still `role="button"` rows, not a full ARIA treeview — a smaller, deliberately scoped fix, not the complete treeview semantics the original v1 scope cut deferred.
- **Avatar** — the all-defaults state (no `label`/`alt`) now gets `aria-hidden="true"` (decorative), since it previously had zero accessible-name mechanism and nothing to hide it from assistive tech either.
- **Image** — preview overlay gained `role="dialog"`/`aria-modal="true"`/`aria-label` (matching `DialogShellComponent`'s own convention), and the broken-image fallback icon gained an `ariaLabel`.

**2 components re-verdicted Partial → By design** (investigation showed the original "gap" was a correct, deliberate scope decision, not a defect):
- **IconField** — never renders icon markup itself; `medIconFieldIcon` is applied by the consumer to their own projected content, so `aria-hidden` responsibility correctly belongs to the consumer.
- **VirtualScroller** — a genuine thin pass-through to Angular CDK's `cdk-virtual-scroll-viewport` with no custom ARIA/keyboard of MedraUi's own to add — same opinion-free profile as DataView.

**3 components stay Partial**, each for a different reason:
- **MegaMenu** and **TieredMenu** — their originally-cited gaps were fixed and tested (ArrowLeft/Home/End for MegaMenu; Home/End/Space for TieredMenu), but each turned out to have a *separate*, unrelated untested gap discovered along the way (MegaMenu: column-header/list ARIA association; TieredMenu: no test asserts literal `aria-haspopup`/`aria-expanded`/`aria-disabled` values) — left open rather than silently expanding scope mid-fix.
- **Fieldset** — unchanged. The `disabled`-cascades-to-descendants claim is genuinely untestable in jsdom (relies on native `<fieldset disabled>` cascading behavior jsdom doesn't implement), confirmed accurate by re-reading the spec's own comment — not a real gap, just an accepted testing-environment limitation.

Mid-run infrastructure note: multiple parallel agents sharing one working directory led to a `git stash` + `git reset --hard HEAD` at some point during the run (not initiated by the coordinating session), which briefly wiped in-progress and already-completed uncommitted work repo-wide, including some already-finished batches that had no live agent left to notice and recover it. Everything was safely captured in the stash beforehand; recovered file-by-file, cross-checked every file the stash had touched against the post-recovery working tree to confirm nothing was still silently reverted, then re-ran the full suite. No permanent data loss — but a reminder that fully parallel agents sharing a single working tree (rather than isolated git worktrees) carries real risk when any one of them runs a destructive git command.

Full suite after this pass: **110 suites, 1318 tests, all passing.** Per-component detail is in each component's own page under `02-components/`.

### Third fix pass: MegaMenu and TieredMenu (2026-08-20)

Of the 3 components left "Partial" after the second pass, 2 had a real, closeable gap (Fieldset's was a genuine jsdom limitation, left as-is):

- **MegaMenu** — the optional column `header` rendered as visually-styled text with no ARIA relationship to its list of items; a screen reader had no way to announce which category a column belonged to when navigating into it. Fixed by giving each header an `id` and each column's `<ul>` `role="group"` + `[attr.aria-labelledby]` pointing at that id (only when a header is set). Verified: `mega-menu.component.spec.ts — 'each column list is a role="group" whose aria-labelledby points at its own header element'`.
- **TieredMenu** — `aria-haspopup`/`aria-expanded`/`aria-disabled` were already correctly implemented in `tiered-menu-panel.component.ts`, but no test asserted their literal values, only structural side effects (submenu count, row text). Added a test asserting the actual attribute values for a parent row (haspopup/expanded), a disabled leaf (disabled, no haspopup), and the expanded-state flip once a submenu opens.

Full suite after this pass: **110 suites, 1320 tests, all passing.**

### Fourth fix pass: Fieldset (2026-08-20)

The last remaining "Partial" verdict. `Fieldset`'s core accessibility claim — `disabled` cascading to every descendant form control via native `<fieldset disabled>` behavior — was only manually verified, since jsdom doesn't implement the browser's disabled-state cascade algorithm (confirmed genuine by re-reading the spec's own comment, `fieldset.component.spec.ts:143-147`). Rather than leave it as a documented manual check, closed it with a real Chromium e2e test using the project's existing Playwright setup: `e2e/fieldset.spec.ts` asserts a nested `<input>` and `<button>` are both actually disabled inside the showcase's disabled-fieldset demo, plus a negative control confirming an enabled fieldset doesn't disable its own children. Both tests pass (`npx playwright test e2e/fieldset.spec.ts`). The Jest spec's explanatory comment was updated to point at the e2e test instead of describing the gap as uncovered.

No "Partial" verdicts remain. The only open item is `DataView`'s "Gap found — by design," which isn't a defect (see above).

## Positive finding worth keeping

Avatar, Badge, Tag, and MeterGroup all reuse `ButtonSeverity` directly from `lib/button/button.styles.ts` — the exact 8-value `primary/secondary/info/success/warn/help/danger/contrast` set — rather than each inventing its own severity vocabulary. This is exactly the kind of cross-component consistency a design system is supposed to enforce, and it was already true before this audit. Worth protecting as new components get added (see `04-governance.md`'s new-component checklist).

## Process note

The Phase 1 categorization initially missed `accordion` (89 folders exist, only 88 + `ripple` were categorized). Caught by diffing the categorized list against `ls lib/` before dispatching Phase 4 work; corrected in `02-components/_index.md` (added to Data Display, next to Card/Panel). Flagging here rather than silently fixing, since it's exactly the kind of slip this audit process exists to catch.

## Not a finding, but notable

No component folder has a `README`. This is the expected starting state for a design system extraction (the whole reason this process exists), not itself scored as a defect.
