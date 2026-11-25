# Proposal: add-dialog-modal

## Why

In `document-dialog-parity`, all existing Dialog capabilities were documented on `/docs/components/dialog`, leaving non-modal dialogs (`[modal]="false"` / `Without Modal`) as the remaining PrimeNG Dialog parity feature (`14-dialog.md`). `OverlayService` already supports `hasBackdrop: false` (non-modal, non-focus-trapped overlays), so exposing `modal` (default `true`) on `DialogComponent`, `DialogService`, and `DialogShellComponent` completes Dialog parity cleanly.

## What Changes

Add a `modal` boolean input/option (default `true`) to `DialogComponent`, `DialogOptions` / `DialogService`, and `DialogShellComponent`, document `Without Modal` (`#example-without-modal`) on `/docs/components/dialog`, verify non-modal backdrop/focus/ARIA behavior in Jest and Playwright, and add a `minor` changeset.

## Scope

### In scope
- `projects/medra/ui/src/lib/dialog/`:
  - `DialogComponent`: add `modal = input(true, { transform: booleanAttribute })`, forward `hasBackdrop: this.modal()` and `closeOnOutsideClick: this.dismissableMask()` to `OverlayService.openGlobalTemplate`, and set `aria-modal` to `'true'` only when `modal()` is `true`.
  - `DialogOptions` / `DialogService` / `DialogShellComponent`: add `modal?: boolean` (default `true`), forward `hasBackdrop: options.modal ?? true` and `closeOnOutsideClick: options.dismissableMask ?? true` to `OverlayService.openGlobal`, and set `aria-modal` on `DialogShellComponent` only when `modal` is `true`.
  - Add Jest unit tests in `dialog.component.spec.ts` and `dialog.service.spec.ts`.
- `projects/site/`: add `Without Modal` (`#example-without-modal`) demo, `.txt` prose, and `EXAMPLES` entry in `dialog.page.ts`.
- `e2e/site/dialog-docs.spec.ts`: verify `Without Modal` in a real browser (no backdrop element, `aria-modal` omitted, background page interactive).
- `.changeset/dialog-modal.md` (`"@medra.dev/ui": minor`).

### Out of scope
- Changing default `modal: true` behavior for existing `<med-dialog>` or `DialogService.open()` callers.

## Track

**Track:** full
**Rationale:** Adds a new public input/option (`modal`) to `DialogComponent` and `DialogService` with ARIA/backdrop behavior, requiring a technical plan, test-first tasks, real-browser verification, and a `minor` changeset.

## Capabilities

| Capability | Status | Requirements |
| --- | --- | --- |
| dialog | modified | DLD-002, DLD-003 |

## Impact

- **Code:** `projects/medra/ui/src/lib/dialog/{dialog.component.ts,dialog.service.ts,dialog-shell.component.ts,*.spec.ts}`, `projects/site/src/app/pages/docs/components/dialog.page.ts`, `demos/dialog-without-modal.demo.{ts,html}`, `content/docs/dialog-without-modal.txt`, `e2e/site/dialog-docs.spec.ts`, `.changeset/dialog-modal.md`
- **Interfaces:** Adds `modal = input(true)` to `DialogComponent` and `modal?: boolean` to `DialogOptions`.
- **Data:** None.
- **Dependencies:** None (adds a `minor` changeset for `@medra.dev/ui`).

## Open Questions

None.
