import { ComponentType } from '@angular/cdk/portal';
import { InjectionToken, Injector } from '@angular/core';
import { Observable } from 'rxjs';

/** Handle a dialog's own content component can inject to close itself. */
export interface DialogRef<TResult = unknown> {
  close(result?: TResult): void;
  readonly closed$: Observable<TResult | undefined>;
  /** Emits once, deferred to a microtask right after the dialog is created and attached — a simplified `onShow`: this library's dialogs have no JS-tracked entrance transition to wait for, see `DialogService`'s own doc. */
  readonly opened$: Observable<void>;
}

export const DIALOG_REF = new InjectionToken<DialogRef>('DIALOG_REF');

/** The `data` passed to `DialogService.open()`, injectable by the content component. */
export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');

/** Internal: what DialogShellComponent needs to render the header and host the content component. */
export interface DialogShellOptions {
  component: ComponentType<unknown>;
  contentInjector: Injector;
  header?: string;
  /** Default: `'Close'` — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  closeLabel?: string;
  /** Default: `true`. */
  closable?: boolean;
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
  /** Maps a `max-width` media-query breakpoint to a dialog width at that breakpoint (e.g. `{ '960px': '75vw', '640px': '90vw' }`) — see `DialogService`'s own doc. */
  breakpoints?: Record<string, string>;
  /** Renders the dialog as modal with a backdrop and `aria-modal="true"`. Default: `true`. */
  modal?: boolean;
}

export const DIALOG_SHELL_OPTIONS = new InjectionToken<DialogShellOptions>('DIALOG_SHELL_OPTIONS');
