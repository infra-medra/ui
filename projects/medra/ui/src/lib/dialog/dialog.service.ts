import { ComponentType } from '@angular/cdk/portal';
import { Injectable, Injector, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { GlobalOverlayPosition, OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { DIALOG_DATA, DIALOG_REF, DIALOG_SHELL_OPTIONS, DialogRef } from './dialog.tokens';
import { DialogShellComponent } from './dialog-shell.component';

export interface DialogOptions<TData = unknown> {
  header?: string;
  /** Default: `'Close'` — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  closeLabel?: string;
  /** Shows the header close button. Default: `true`. */
  closable?: boolean;
  /** Default: `'center'`, same as every other `openGlobal` overlay. */
  position?: GlobalOverlayPosition;
  /** Drag by the header. Default: `false`. */
  draggable?: boolean;
  /** Drag-resize from the bottom-right corner. Default: `false`. */
  resizable?: boolean;
  /** Shows a maximize/restore toggle in the header. Default: `false`. */
  maximizable?: boolean;
  /** Default: `'Maximize'` — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  maximizeLabel?: string;
  /** Default: `'Restore'` — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  restoreLabel?: string;
  /** Maps a `max-width` media-query breakpoint to a dialog width at that breakpoint (e.g. `{ '960px': '75vw', '640px': '90vw' }`). */
  breakpoints?: Record<string, string>;
  /** Close on pressing Escape. Default: `true`. */
  closeOnEscape?: boolean;
  /**
   * Close on clicking the backdrop. Default: `true` — every dialog opened before this option
   * existed already closed on a backdrop click, so flipping the default here would be a silent
   * behavior regression for every existing caller. Pass `false` for a dialog that must be dismissed
   * some other, more deliberate way (an unsaved-changes confirmation, say).
   */
  dismissableMask?: boolean;
  /** Renders the dialog as modal with a backdrop, focus trap, and `aria-modal="true"`. Default: `true`. */
  modal?: boolean;
  data?: TData;
}

/**
 * Dialog primitive (Trilha 3, pilot #4). Imperative service (like Toast),
 * built on OverlayService (Trilha 2) rather than reimplementing overlay
 * mechanics: backdrop, focus trap, close-on-Escape/backdrop-click, and
 * focus restoration on close all come from there, unchanged.
 *
 * The consumer's own content component is created dynamically inside an
 * internal shell (header + close button), the same pattern Angular
 * Material's Dialog uses — this avoids needing template-portal machinery
 * in OverlayService just for this one case.
 *
 * `position` reuses `OverlayService`'s own `GlobalOverlayPosition` (the same
 * type Toast's `position` takes) — plumbed straight through to
 * `openGlobal()`, nothing dialog-specific about it. `draggable`/`resizable`/
 * `maximizable` are all rendered/handled inside `DialogShellComponent` (see
 * its own doc comment) since they're about the shell's own box, not
 * anything `OverlayService` needs to know about.
 *
 * **`closeOnEscape`/`dismissableMask`, `breakpoints`, `opened$`**.
 *
 * **`closeOnEscape`/`dismissableMask`** are per-call passthroughs onto
 * `OverlayService.openGlobal()`'s own already-existing `closeOnEscape`/`closeOnBackdropClick`
 * options (every overlay in this library already supports both, Dialog just hadn't exposed them
 * through its own `open()` call yet) — `dismissableMask` is mapped straight onto this library's
 * existing `closeOnBackdropClick` option. `dismissableMask`'s *default* stays `true` here why
 * flipping it would silently change every dialog opened before this option existed.
 *
 * **`breakpoints`** injects a small scoped `<style>` element (client-only, `afterNextRender()` in
 * `DialogShellComponent`, same SSR/hydration-safe pattern
 * `CarouselComponent`'s/`GalleriaComponent`'s own `resize` listeners already use) with one `@media
 * (max-width: ...)` rule per breakpoint, targeting a `data-dialog-id` attribute unique to that one
 * shell instance (a plain inline/host style can't express a media query at all), scoped by
 * attribute class name for an identical reason.
 *
 * **`opened$`** (on `DialogRef`, alongside the existing `closed$`) fires once, deferred to a
 * microtask so the caller has a chance to subscribe to the just-returned `dialogRef` first (a plain
 * `Subject` doesn't replay to a late subscriber — emitting synchronously inside `open()` itself
 * would fire before the caller could ever receive it). This is a deliberately simplified `onShow`:
 * this library's dialogs have no JS-tracked entrance transition to wait for —
 * `OverlayService.openGlobal()` creates and attaches the component synchronously, so "shown" and
 * "created" are effectively the same moment here.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly overlayService = inject(OverlayService);
  private readonly parentInjector = inject(Injector);

  open<T, TResult = unknown>(component: ComponentType<T>, options: DialogOptions = {}): DialogRef<TResult> {
    const closedSubject = new Subject<TResult | undefined>();
    const openedSubject = new Subject<void>();
    let handle: OverlayHandle<DialogShellComponent, TResult> | undefined;

    const dialogRef: DialogRef<TResult> = {
      close: (result) => handle?.close(result),
      closed$: closedSubject.asObservable(),
      opened$: openedSubject.asObservable(),
    };

    const contentInjector = Injector.create({
      parent: this.parentInjector,
      providers: [
        { provide: DIALOG_DATA, useValue: options.data },
        { provide: DIALOG_REF, useValue: dialogRef },
      ],
    });

    const shellInjector = Injector.create({
      parent: this.parentInjector,
      providers: [
        { provide: DIALOG_REF, useValue: dialogRef },
        {
          provide: DIALOG_SHELL_OPTIONS,
          useValue: {
            component,
            contentInjector,
            header: options.header,
            closeLabel: options.closeLabel,
            closable: options.closable,
            draggable: options.draggable,
            resizable: options.resizable,
            maximizable: options.maximizable,
            maximizeLabel: options.maximizeLabel,
            restoreLabel: options.restoreLabel,
            breakpoints: options.breakpoints,
            modal: options.modal ?? true,
          },
        },
      ],
    });

    handle = this.overlayService.openGlobal<DialogShellComponent, TResult>(DialogShellComponent, {
      position: options.position,
      injector: shellInjector,
      hasBackdrop: options.modal ?? true,
      closeOnEscape: options.closeOnEscape,
      closeOnBackdropClick: options.dismissableMask,
      closeOnOutsideClick: options.dismissableMask,
      // Not the pane: see the comment on DialogShellComponent's host classes
      // for why the dialog box's own sizing/visuals live there instead of
      // in `panelClass` (which targets `.cdk-overlay-pane` — a selector the
      // CDK itself also styles via a runtime-injected, unlayered
      // stylesheet, which silently wins over any of our Tailwind utilities
      // targeting that same selector, layered or not).
      panelClass: [],
    });

    handle.closed$.subscribe((result) => {
      closedSubject.next(result);
      closedSubject.complete();
    });

    // Deferred to a microtask — `open()` itself creates the dialog
    // synchronously, but emitting `opened$` synchronously too would fire it
    // *before* the caller ever gets `dialogRef` back to subscribe to it in
    // the first place (a `Subject` doesn't replay to a late subscriber).
    queueMicrotask(() => {
      openedSubject.next();
      openedSubject.complete();
    });

    return dialogRef;
  }
}
