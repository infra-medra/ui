# Review: document-dialog-parity — verify

**Stage:** verify
**Verdict:** pass-with-findings
**Counts:** critical 0 · major 0 · minor 4
**Reviewer:** reviewer agent
**Date:** 2026-11-25

## Summary

`document-dialog-parity` satisfies `REQ DLD-001` (`DLD-001.S1`) and Constitution Articles I–VIII, X, and XI with zero unintended changes under `projects/medra/ui/`, a passing `npm run build:site`, and a passing Playwright real-browser check in `e2e/site/dialog-docs.spec.ts`. All 9 sections render in the required order with interactive demos, non-empty code blocks, and zero console or hydration errors, while the `Draggable` and `Resizable` prose accurately scopes those options to `DialogService.open()`. Four minor documentation and demo polish items remain (unrecognized `primary-*` color classes in two demo templates, omitted `.demo.ts` code blocks on `DialogService` demos, unclarified `DialogService`-only scope for `breakpoints` in `dialog-behavior.txt`, and unreferenced legacy `dialog-window-controls` files), so the verdict is `pass-with-findings`.

## Findings

### F-01 [minor] Unknown `primary-*` color tokens used in Template and Headless demo icons

**Where:** `projects/site/src/app/pages/docs/components/demos/dialog-template.demo.html:5`, `projects/site/src/app/pages/docs/components/demos/dialog-headless.demo.html:6` · `DLD-001`
**Problem:** Both demo templates apply `text-primary-600 dark:text-primary-400` to `<med-icon>`, whereas `projects/medra/ui/src/styles/tailwind-theme-medraui.css:18-28` and `projects/site/src/styles.css` define `--color-brand-*` tokens rather than `--color-primary-*`. Inspection of the built CSS (`projects/site/dist/client/assets/*.css`) confirms `text-brand-400` and `text-brand-600` are generated while zero `text-primary-*` rules exist, so both icons silently drop their accent color in light and dark modes and teach consumers invalid utility classes.
**Fix:** Replace `text-primary-600 dark:text-primary-400` with `text-brand-600 dark:text-brand-400` in both `dialog-template.demo.html` and `dialog-headless.demo.html`.

### F-02 [minor] `DialogService` demo code blocks show only trigger button HTML

**Where:** `projects/site/src/app/pages/docs/components/dialog.page.ts:18-26`, `projects/site/src/app/pages/docs/components/dialog.page.ts:88-139` · `DLD-001`
**Problem:** `Basic`, `Draggable`, `Resizable`, and `Responsive & Dismissal` configure `DialogService.open(...)` in their `.demo.ts` files (`draggable: true`, `resizable: true`, `closeOnEscape`, `dismissableMask`, `breakpoints`), yet `dialog.page.ts` only binds `.demo.html?raw` to `<app-code-block>`. For `Draggable` and `Resizable` (`dialog-draggable.demo.html:1`, `dialog-resizable.demo.html:1`), the rendered code snippet is only `<button medButton variant="outlined" (click)="open()">Show</button>`, omitting the `DialogService` API options described in the prose (unlike `listbox.page.ts:48-49,266-267`, which renders both HTML and `.demo.ts?raw`).
**Fix:** Import and render the `.demo.ts?raw` source with `<app-code-block>` alongside the HTML snippet for the `DialogService`-driven demos (`Basic`, `Draggable`, `Resizable`, and `Responsive & Dismissal`).

### F-03 [minor] `Responsive & Dismissal` prose does not specify `DialogService.open()` for `breakpoints`

**Where:** `projects/site/src/content/docs/dialog-behavior.txt:5-7` · `DLD-001`
**Problem:** `dialog-draggable.txt:3` and `dialog-resizable.txt:3` explicitly scope `draggable` and `resizable` to `DialogService.open()` because `DialogComponent` (`projects/medra/ui/src/lib/dialog/dialog.component.ts:122-123,129`) declares `draggable`, `resizable`, and `breakpoints` inputs without reading them. `dialog-behavior.txt:5-7` describes `breakpoints` generically alongside `closeOnEscape` and `dismissableMask` without noting that `breakpoints` is currently implemented only in `DialogService.open()` / `DialogShellComponent` (`projects/medra/ui/src/lib/dialog/dialog-shell.component.ts:219-234`), even though `breakpoints` also appears in the generated `projects/site/src/content/api/dialog.json:94-99` table.
**Fix:** Clarify in `projects/site/src/content/docs/dialog-behavior.txt` that `breakpoints` applies to `DialogService.open()` (while `closeOnEscape` and `dismissableMask` work on both `<med-dialog>` and `DialogService.open()`).

### F-04 [minor] Superseded `dialog-window-controls` demo and prose files remain unreferenced

**Where:** `projects/site/src/app/pages/docs/components/demos/dialog-window-controls.demo.ts:1`, `projects/site/src/app/pages/docs/components/demos/dialog-window-controls.demo.html:1`, `projects/site/src/content/docs/dialog-window-controls.txt:1` · `DLD-001`
**Problem:** Splitting the former `Window-like controls` section into `Maximizable`, `Draggable`, and `Resizable` left `dialog-window-controls.demo.ts`, `dialog-window-controls.demo.html`, and `dialog-window-controls.txt` orphaned with no remaining references in `projects/site/`, `e2e/`, or `docs/changes/document-dialog-parity/`.
**Fix:** Remove the three unused `dialog-window-controls` files when cleaning up the documentation page.

## Coverage

| Requirement | Evidence | Status |
|---|---|---|
| `DLD-001` | `projects/site/src/app/pages/docs/components/dialog.page.ts:39-49,81-142`; `projects/site/src/content/docs/dialog-*.txt`; `projects/site/src/app/pages/docs/components/demos/dialog-*.demo.{ts,html}`; `e2e/site/dialog-docs.spec.ts:17-102` (`DLD-001.S1`); `T001` (`red` 2026-11-25) & `T002` (`green` 2026-11-25); verified `npm run build:site` (exit 0) and `npx playwright test --reporter=list --project=site e2e/site/dialog-docs.spec.ts` (1 passed, 4.6s) | met |
