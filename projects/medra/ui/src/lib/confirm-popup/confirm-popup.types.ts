import { TemplateRef } from '@angular/core';
import { MessageSeverity } from '../message/message.styles';
import { ButtonSeverity } from '../button/button.styles';

export interface ConfirmPopupOptions {
  /** Exact key targeting a declarative `<med-confirm-popup key="...">` host (`M-04`). */
  key?: string;
  message: string;
  /** Drives the icon (via `MESSAGE_SEVERITY_ICON`, same map Message/Toast/ConfirmDialog use) and, unless `acceptSeverity` is set, the accept button's color too. Default: `'info'`. */
  severity?: MessageSeverity;
  /** Overrides the icon name `severity` would otherwise pick. */
  icon?: string;
  /**
   * Replaces the icon+message block with rich content, keeping the
   * default Accept/Reject buttons. Grab a `TemplateRef` from your own
   * component and pass it here — same imperative-service pattern
   * `ConfirmDialogService.confirm()`'s `messageTemplate` uses, see that
   * service's own doc. Context: `{ $implicit: data }` (this popup's
   * resolved `ConfirmPopupData`)
   * template's own `{ $implicit: confirmation }` shape. Ignored when
   * `headlessTemplate` is set.
   */
  contentTemplate?: TemplateRef<{ $implicit: ConfirmPopupData }>;
  /**
   * Replaces the popup's entire body (icon, message, and the Accept/ Reject buttons) with fully
   * custom content. Context: `{ $implicit: data, onAccept, onReject }` — call `onAccept()`/
   * `onReject()` to resolve the popup the same way the built-in buttons would. This service's
   * `confirm()` returns a handle to subscribe to rather than taking callbacks, so without
   * `onAccept`/`onReject` in the context a headless template would have no way to resolve the popup
   * at all. `ConfirmDialogService`'s own `headlessTemplate` context has the same shape, for
   * consistency within this library.
   */
  headlessTemplate?: TemplateRef<{ $implicit: ConfirmPopupData; onAccept: () => void; onReject: () => void }>;
  /** Default: `'Yes'` — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  acceptLabel?: string;
  /** Default: `'No'`. */
  rejectLabel?: string;
  /** Default: `severity === 'danger' ? 'danger' : 'primary'` — same default ConfirmDialog uses. */
  acceptSeverity?: ButtonSeverity;
  /** Default: `'secondary'`. */
  rejectSeverity?: ButtonSeverity;
  /** Hides the accept button entirely. Default: `true`. */
  acceptVisible?: boolean;
  /** Hides the reject button entirely. Default: `true`. */
  rejectVisible?: boolean;
  /**
   * Which button receives initial focus. Default: `'reject'` — see `ConfirmPopupContentComponent`'s
   * own doc for why "dismissal is the safe default" already applied here before this option
   * existed.
   */
  defaultFocus?: 'accept' | 'reject' | 'none';
}

/** Internal: what `ConfirmPopupContentComponent` receives via `@Input()`. */
export interface ConfirmPopupData {
  message: string;
  iconName: string;
  iconClass: string;
  acceptLabel: string;
  rejectLabel: string;
  acceptSeverity: ButtonSeverity;
  rejectSeverity: ButtonSeverity;
  acceptVisible: boolean;
  rejectVisible: boolean;
  defaultFocus: 'accept' | 'reject' | 'none';
  contentTemplate?: TemplateRef<{ $implicit: ConfirmPopupData }>;
  headlessTemplate?: TemplateRef<{ $implicit: ConfirmPopupData; onAccept: () => void; onReject: () => void }>;
}
