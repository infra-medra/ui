import { TemplateRef } from '@angular/core';
import { GlobalOverlayPosition } from '../overlay/overlay.service';
import { MessageSeverity } from '../message/message.styles';

export interface ToastOptions {
  /** Exact channel key targeting a declarative `<med-toast key="...">` host (`M-04`). */
  key?: string;
  severity?: MessageSeverity;
  summary?: string;
  detail?: string;
  /** Auto-dismiss after this many ms. `0` means sticky (no auto-dismiss). Default: `3000`. */
  life?: number;
  /** When `true`, keeps the toast open until explicitly dismissed (`life = 0`). Default: `false`. */
  sticky?: boolean;
  /** When `true`, suppresses adding a duplicate toast with matching `key`, `severity`, `summary`, and `detail`. Default: `false`. */
  preventDuplicates?: boolean;
  /** Default: `true`. */
  closable?: boolean;
  /** Default: `'Close'` — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  closeLabel?: string;
  /**
   * Which corner/edge to anchor the (single, shared) toast stack to.
   * Default: `'top-right'`. Applies to the whole stack, not just this one
   * message — the first call ever made picks the stack's starting position;
   * a later call with a *different* `position` moves the existing stack
   * there (see `OverlayService.repositionGlobal`) rather than opening a
   * second, independent stack.
   */
  position?: GlobalOverlayPosition;
  /**
   * Replaces this toast's summary/detail text with rich content, keeping
   * the surrounding `<med-message>` chrome (icon, severity color, close
   * button). Grab a `TemplateRef` from your own component and pass it here
   * — same imperative-service pattern `ConfirmDialogService.confirm()`'s
   * `messageTemplate` uses. Context: `{ $implicit: message }` (this
   * toast's resolved `ToastMessage`)
   * template's own `{ $implicit: message }` shape. Ignored when
   * `headlessTemplate` is set.
   */
  messageTemplate?: TemplateRef<{ $implicit: ToastMessage }>;
  /**
   * Replaces this toast's entire rendered output — no `<med-message>` chrome at all, not even the
   * close button — with fully custom content. Context: `{ $implicit: message, onClose }` — call
   * `onClose()` to dismiss this toast the same way its close button would.
   */
  headlessTemplate?: TemplateRef<{ $implicit: ToastMessage; onClose: () => void }>;
}

export interface ToastMessage extends Required<Pick<ToastOptions, 'severity' | 'life' | 'closable' | 'closeLabel'>> {
  id: number;
  key?: string;
  sticky?: boolean;
  summary?: string;
  detail?: string;
  messageTemplate?: TemplateRef<{ $implicit: ToastMessage }>;
  headlessTemplate?: TemplateRef<{ $implicit: ToastMessage; onClose: () => void }>;
}
