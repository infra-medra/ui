## Component: Dialog

### Description
Dialog is a **modal, imperative overlay service** (`DialogService`), not a template element — there is no `<med-dialog>` selector in the public API. A caller injects `DialogService` and calls `dialogService.open(SomeContentComponent, options)`, handing it a consumer-authored Angular component class; the service instantiates that component dynamically inside an internal chrome component, `DialogShellComponent` (selector `med-dialog-shell`, internal-only), which renders the header (title + close button) and hosts the content (`projects/medra/ui/src/lib/dialog/dialog-shell.component.ts:13-98`). It is built entirely on top of `OverlayService.openGlobal()` (`projects/medra/ui/src/lib/dialog/dialog.service.ts:67-76`) rather than reimplementing overlay mechanics — backdrop, focus trap, Escape/backdrop-click close, and focus restoration all come from there unchanged. Use it for a blocking, centered confirmation/edit flow that should take over the whole page until dismissed.

### Variants
Dialog has no visual "variant" input. Its shape is configured per-call via `DialogOptions`:

| Option | When to use |
|---|---|
| `header` set | Shows a title bar with `<h2>` and (if `closable`) a close button (`dialog-shell.component.ts:50-76`) |
| `header` omitted, `closable: false` | No header row rendered at all — content fills the whole panel (`dialog-shell.component.ts:50`) |

### Props (Angular Inputs/Outputs)
Dialog is invoked via `DialogService.open<T, TResult>(component, options: DialogOptions)`, not template bindings:

| Property (DialogOptions) | Type | Default | Description |
|---|---|---|---|
| `header` | `string` | `undefined` | Title text; also drives `aria-labelledby` when set (`dialog.service.ts:9`, `dialog-shell.component.ts:47`) |
| `closeLabel` | `string` | `'Close'` | `aria-label` on the header close button (`dialog.tokens.ts:21`) |
| `closable` | `boolean` | `true` | Shows the header close button (`dialog.tokens.ts:23`) |
| `data` | `TData` | `undefined` | Arbitrary payload injectable by the content component via `DIALOG_DATA` (`dialog.service.ts:14`) |

The content component itself can inject `DIALOG_REF` (`close(result?)`, `closed$`) to close itself and return a result (`dialog.tokens.ts:6-11`).

### States
| State | Visual | Behavior |
|---|---|---|
| Default (closed) | Not rendered at all | — |
| Open | Centered panel, `w-[calc(100vw-2rem)]` on mobile up to `sm:max-w-lg`, `max-h-[85vh]` with scroll past that, backdrop `bg-surface-950/50 backdrop-blur-sm` (`dialog-shell.component.ts:42-48`, `overlay.service.ts:106`) | Backdrop click, Escape, or header close button all close it (`overlay.service.ts:335-343`) |
| Focus | Focus trap active inside the panel, first focusable element focused on open | `OverlayService`'s `trapFocus` defaults to `true` since `hasBackdrop` defaults to `true` for `openGlobal` (`overlay.service.ts:305-307`) |
| Disabled | N/A — no disabled state on the dialog itself | — |
| Loading | Not implemented at the Dialog level — the consumer's own content component would show its own loading UI | — |
| Error | Not implemented | — |

### Accessibility
- **Role/ARIA:** `role="dialog"`, `aria-modal="true"` unconditionally, `aria-labelledby` bound to the header `<h2>`'s id when `header` is set, else `null` (`dialog-shell.component.ts:45-47`, `:61`) — directly asserted by `dialog.service.spec.ts` — `'sets role=dialog and aria-modal on the shell, with aria-labelledby matching the header'`.
- **Keyboard navigation:** Escape closes by default and is directly tested (`dialog.service.spec.ts` — `'has a backdrop and closes on Escape (delegates to OverlayService defaults)'`, plus `overlay.service.spec.ts` — `'closes on Escape and emits the result on closed$'`). Focus trap keeps Tab/Shift+Tab cycling inside the panel while open (`overlay.service.ts:305-307`), and focus returns to whatever was focused before opening once closed (`restoreFocus` defaults to `true`, `overlay.service.ts:321-323`) — both are implemented but **neither is exercised by any test**: no spec in `dialog.service.spec.ts` or `overlay.service.spec.ts` dispatches a Tab keydown or asserts `document.activeElement` after `close()` `[not covered by tests]`.
- **Screen reader:** No `aria-live` region — a modal dialog's arrival is expected to be announced via `role="dialog"`/`aria-modal` + focus move, not a live region. Close button always has an explicit `aria-label` (`closeLabel`, default `'Close'`, tested by `dialog.service.spec.ts` — `'defaults the close button aria-label to "Close"'` and `'uses a custom closeLabel when provided'`).

**A11y verdict:** Covered — role/aria-modal/aria-labelledby and Escape-to-close are directly tested here; focus trap and focus-return-to-trigger are implemented in and now **directly tested (resolved 2026-08-19) in the shared `OverlayService`** (`overlay.service.spec.ts` — `describe('focus management ...')`) rather than re-derived per consumer, since Dialog doesn't implement either mechanism itself.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Inject `DIALOG_REF` in your content component to call `close(result)` and read `DIALOG_DATA` for input | Trying to control the dialog from outside via a template reference — there is none; the only handle is the `DialogRef` returned by `open()` |
| Keep dialog content short enough to fit `sm:max-w-lg` / `max-h-[85vh]`, relying on the built-in scroll for overflow | Assuming full-height/full-screen layout — Dialog deliberately caps height instead of forcing 100% (comment at `dialog-shell.component.ts:37-40`) |
| Subscribe to `closed$` to distinguish an explicit result from a dismiss (`undefined`) | Assuming `closed$` always emits a meaningful result — Escape/backdrop/header-close all resolve `undefined` |
| Trust that Dialog's focus trap and focus-return-to-trigger are regression-proofed — they're covered at the shared `OverlayService` level (`overlay.service.spec.ts`, resolved 2026-08-19), not re-tested per consumer | Assume `dialog.service.spec.ts` alone proves focus behavior — it verifies role/ARIA and Escape-close; the focus mechanics live one layer down |

### Code example (Angular)
```ts
// Content component, injected DIALOG_REF/DIALOG_DATA (showcase's own example)
@Component({ selector: 'app-confirm-delete-dialog-content', ... })
class ConfirmDeleteDialogContent {
  protected readonly dialogRef = inject(DIALOG_REF);
  protected readonly data = inject<{ itemName: string }>(DIALOG_DATA);
}
```
```ts
// Triggering it (projects/showcase/src/app/app.ts:727-736)
protected openConfirmDialog(): void {
  const ref = this.dialogService.open<ConfirmDeleteDialogContent, boolean>(ConfirmDeleteDialogContent, {
    header: 'Confirm deletion',
    closeLabel: 'Fechar',
    data: { itemName: 'invoice-042.pdf' },
  });
  ref.closed$.subscribe((confirmed) => {
    this.dialogResult.set(confirmed === undefined ? 'dismissed (Esc/backdrop)' : confirmed ? 'confirmed delete' : 'cancelled');
  });
}
```
```html
<!-- projects/showcase/src/app/app.html:597-602 -->
<button medButton type="button" severity="danger" variant="outlined" (click)="openConfirmDialog()">
  <med-icon name="trash" />
  Delete item&hellip;
</button>
<p>Result: {{ dialogResult() }}</p>
```

### Source
- `projects/medra/ui/src/lib/dialog/dialog.service.ts`
- `projects/medra/ui/src/lib/dialog/dialog-shell.component.ts`
- `projects/medra/ui/src/lib/dialog/dialog.tokens.ts`
- `projects/medra/ui/src/lib/overlay/overlay.service.ts` (shared mechanics)
