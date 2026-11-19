import { TemplateRef } from '@angular/core';
import { MessageSeverity } from '../message/message.styles';
import { ButtonSeverity } from '../button/button.styles';
import { GlobalOverlayPosition } from '../overlay/overlay.service';

export interface ConfirmDialogOptions {
  /** Exact key targeting a declarative `<med-confirm-dialog key="...">` host (`M-04`). */
  key?: string;
  message: string;
  header?: string;
  /** Drives the icon (via `MESSAGE_SEVERITY_ICON`, same map Message/Toast use) and, unless `acceptSeverity` is set, the accept button's color too. Default: `'info'`. */
  severity?: MessageSeverity;
  /** Overrides the icon name `severity` would otherwise pick. */
  icon?: string;
  /**
   * Replaces the plain-string `message` with rich content. Grab a `TemplateRef` from your own
   * component (`#tpl` + `@ViewChild('tpl')` or `viewChild()`) and pass it here — this service is
   * imperative, so there's no persistent `<med-confirm-dialog>` placeholder in the app root to
   * project a `<ng-template>` into. Context: `{ $implicit: data }` (this dialog's resolved
   * `ConfirmDialogData`). Ignored when `headlessTemplate` is set.
   */
  messageTemplate?: TemplateRef<{ $implicit: ConfirmDialogData }>;
  /**
   * Replaces the dialog's entire body (icon, message, and the Accept/ Reject buttons) with fully
   * custom content — same grab-a-`TemplateRef`-from-your-own-component mechanism as
   * `messageTemplate`. Context: `{ $implicit: data, onAccept, onReject }` — call `onAccept()`/
   * `onReject()` from the template to resolve the dialog the same way the built-in buttons would.
   */
  headlessTemplate?: TemplateRef<{ $implicit: ConfirmDialogData; onAccept: () => void; onReject: () => void }>;
  /** Default: `'Yes'` — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  acceptLabel?: string;
  /** Default: `'No'`. */
  rejectLabel?: string;
  /** Default: `severity === 'danger' ? 'danger' : 'primary'` — a destructive confirmation gets a destructive-colored accept button without the caller having to say so twice. */
  acceptSeverity?: ButtonSeverity;
  /** Default: `'secondary'`. */
  rejectSeverity?: ButtonSeverity;
  /** Shows the header close button. Default: `true`. */
  closable?: boolean;
  /** Default: `'Close'`. */
  closeLabel?: string;
  /** Hides the accept button entirely. Default: `true`. */
  acceptVisible?: boolean;
  /** Hides the reject button entirely. Default: `true`. */
  rejectVisible?: boolean;
  /**
   * Which control receives initial focus. Default: `'reject'` — see
   * `ConfirmDialogContentComponent`'s own doc for why "dismissal is the safe default" already
   * applied here before this option existed. `'close'` targets the header close button, which lives
   * in `DialogShellComponent`, not this content component — see that file's own doc for how a
   * `defaultFocus: 'close'` request reaches it.
   */
  defaultFocus?: 'accept' | 'reject' | 'close' | 'none';
  /** Passed straight through to `DialogService.open()` — `OverlayService`'s own `GlobalOverlayPosition`. Default: `'center'`. */
  position?: GlobalOverlayPosition;
  /** Passed straight through to `DialogService.open()`. Drag by the header. Default: `false`. */
  draggable?: boolean;
}

/** Internal: what `ConfirmDialogContentComponent` reads via `DIALOG_DATA`. */
export interface ConfirmDialogData {
  message: string;
  iconName: string;
  iconClass: string;
  acceptLabel: string;
  rejectLabel: string;
  acceptSeverity: ButtonSeverity;
  rejectSeverity: ButtonSeverity;
  acceptVisible: boolean;
  rejectVisible: boolean;
  defaultFocus: 'accept' | 'reject' | 'close' | 'none';
  messageTemplate?: TemplateRef<{ $implicit: ConfirmDialogData }>;
  headlessTemplate?: TemplateRef<{ $implicit: ConfirmDialogData; onAccept: () => void; onReject: () => void }>;
}
