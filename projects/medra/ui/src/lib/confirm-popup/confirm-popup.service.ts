import { Injectable, inject } from '@angular/core';
import { MESSAGE_SEVERITY_ICON, MESSAGE_SEVERITY_ICON_CLASS } from '../message/message.styles';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import type { ConfirmPopupComponent } from './confirm-popup.component';
import { ConfirmPopupContentComponent } from './confirm-popup-content.component';
import { ConfirmPopupOptions } from './confirm-popup.types';

const CONFIRM_POPUP_PANEL_CLASS = [
  'w-72',
  'rounded-lg',
  'border',
  'border-surface-200',
  'bg-surface-0',
  'p-4',
  'shadow-overlay-lg',
  'dark:border-surface-700',
  'dark:bg-surface-800',
];

/**
 * ConfirmPopup primitive (Tier 3): same icon + message + Accept/Reject shape
 * as `ConfirmDialogService`, but anchored to a trigger element via
 * `OverlayService.openConnected()` (non-modal, no backdrop — like
 * Popover/Menu) instead of `DialogService`'s modal, centered stack. Use this
 * for a lightweight "are you sure?" next to the control that triggered it
 * (a row's delete icon button); use `ConfirmDialogService` when the action
 * warrants blocking the whole page.
 *
 * `confirm()` takes the triggering element explicitly (`origin`) rather than
 * reading `event.currentTarget` itself, same as `MenuComponent.open()`/
 * `PopoverComponent.open()` — the caller already has it from its own click
 * handler.
 *
 * **`acceptVisible`/`rejectVisible`/`defaultFocus`**. **`key` deliberately NOT implemented**: there
 * is no routing between declared instances to do, since `confirm()` creates its own independent
 * overlay directly via `OverlayService.openConnected()` rather than dispatching to any
 * pre-declared, shared instance (see this file's own earlier doc). Every call is already its own
 * instance; there's nothing for a `key` to disambiguate between.
 *
 * **`contentTemplate`/`headlessTemplate`**: the same grab-a-`TemplateRef`-and-pass-it-in mechanism
 * `ConfirmDialogService` uses, see that service's own doc. See `ConfirmPopupOptions`' own doc for
 * why `headlessTemplate`'s context deliberately adds `onAccept`/ `onReject` that the reference
 * library's own one doesn't have.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmPopupService {
  private readonly overlayService = inject(OverlayService);
  private readonly hosts = new Set<ConfirmPopupComponent>();

  /** @internal */
  registerHost(host: ConfirmPopupComponent): void {
    this.hosts.add(host);
  }

  /** @internal */
  unregisterHost(host: ConfirmPopupComponent): void {
    this.hosts.delete(host);
  }

  private findHost(key?: string): ConfirmPopupComponent | undefined {
    for (const host of this.hosts) {
      if (host.key() === key) {
        return host;
      }
    }
    return undefined;
  }

  confirm(origin: HTMLElement, options: ConfirmPopupOptions): OverlayHandle<ConfirmPopupContentComponent, boolean> | null {
    const host = this.findHost(options.key);
    const severity = options.severity ?? host?.severity() ?? 'info';
    const acceptSeverity = options.acceptSeverity ?? host?.acceptSeverity() ?? (severity === 'danger' ? 'danger' : 'primary');

    const handle = this.overlayService.openConnected<ConfirmPopupContentComponent, boolean>(origin, ConfirmPopupContentComponent, {
      panelClass: CONFIRM_POPUP_PANEL_CLASS,
      restoreFocus: true,
    });
    handle.componentRef.setInput('data', {
      message: options.message ?? host?.message() ?? '',
      iconName: options.icon ?? host?.icon() ?? MESSAGE_SEVERITY_ICON[severity],
      iconClass: MESSAGE_SEVERITY_ICON_CLASS[severity],
      acceptLabel: options.acceptLabel ?? host?.acceptLabel() ?? 'Yes',
      rejectLabel: options.rejectLabel ?? host?.rejectLabel() ?? 'No',
      acceptSeverity,
      rejectSeverity: options.rejectSeverity ?? host?.rejectSeverity() ?? 'secondary',
      acceptVisible: options.acceptVisible ?? host?.acceptVisible() ?? true,
      rejectVisible: options.rejectVisible ?? host?.rejectVisible() ?? true,
      defaultFocus: options.defaultFocus ?? host?.defaultFocus() ?? 'reject',
      contentTemplate: options.contentTemplate ?? host?.contentTemplate(),
      headlessTemplate: options.headlessTemplate ?? host?.headlessTemplate(),
    });

    handle.componentRef.instance.resolved.subscribe((result: boolean) => handle.close(result));

    return handle;
  }
}
