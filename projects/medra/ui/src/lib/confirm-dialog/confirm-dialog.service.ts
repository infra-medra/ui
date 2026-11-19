import { Injectable, inject } from '@angular/core';
import { DialogRef } from '../dialog/dialog.tokens';
import { DialogService } from '../dialog/dialog.service';
import { MESSAGE_SEVERITY_ICON, MESSAGE_SEVERITY_ICON_CLASS } from '../message/message.styles';
import type { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogOptions } from './confirm-dialog.types';
import { ConfirmDialogContentComponent } from './confirm-dialog-content.component';

/**
 * ConfirmDialog primitive (Tier 2). Imperative service (like Toast/Dialog),
 * built entirely on top of `DialogService` rather than a second overlay
 * implementation — `confirm()` just supplies a built-in content component
 * (icon + message + Accept/Reject) so callers don't each hand-roll their own
 * confirmation dialog content the way the showcase's own pre-existing manual
 * example did.
 *
 * `closed$` resolves `true` (Accept), `false` (Reject), or `undefined`
 * (dismissed via Esc/backdrop/header close button) — same three-way result
 * `DialogService` itself already returns, just narrowed to a boolean.
 *
 * **`acceptVisible`/`rejectVisible`/`defaultFocus`, `position`/`draggable`**.
 * `position`/`draggable` are plain passthroughs onto `DialogService.open()` — that service already
 * supports both, `confirm()` just hadn't forwarded them through its own narrower options yet.
 * `acceptVisible`/`rejectVisible`/`defaultFocus` mirror `ConfirmPopupService`'s own identical
 * additions this same item — see that file's doc for the shared reasoning (including
 * `defaultFocus`'s default staying `'reject'`). **A `key` routing option is deliberately NOT
 * implemented**, same reasoning `ConfirmPopupService` already documents: nothing for it to route
 * between when every `confirm()` call already creates its own independent dialog instance via
 * `DialogService.open()`.
 *
 * **`messageTemplate`/`headlessTemplate`**: this service is imperative and has no persistent
 * placeholderder (every `confirm()` call opens its own independent `DialogService` instance, see
 * above), so there's nowhere to project a `<ng-template>` into. Adapted instead to plain
 * `TemplateRef` options, the same "grab a `TemplateRef` from your own component and hand it to an
 * imperative API" pattern Angular Material's own Dialog/Snackbar use for custom content — see
 * `ConfirmDialogOptions`' own doc for the exact context shapes. An `iconTemplate` is **not**
 * duplicated as a third template option here: this service's `icon` already accepts a plain icon
 * *name* string (an `IconComponent` name class), which already covers swapping the icon — a full
 * template override on top would only matter for icon markup an `IconComponent` fundamentally can't
 * express, not a real gap found in practice.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialogService = inject(DialogService);
  private readonly hosts = new Set<ConfirmDialogComponent>();

  /** @internal */
  registerHost(host: ConfirmDialogComponent): void {
    this.hosts.add(host);
  }

  /** @internal */
  unregisterHost(host: ConfirmDialogComponent): void {
    this.hosts.delete(host);
  }

  private findHost(key?: string): ConfirmDialogComponent | undefined {
    for (const host of this.hosts) {
      if (host.key() === key) {
        return host;
      }
    }
    return undefined;
  }

  confirm(options: ConfirmDialogOptions): DialogRef<boolean> {
    const host = this.findHost(options.key);
    const severity = options.severity ?? host?.severity() ?? 'info';
    const acceptSeverity = options.acceptSeverity ?? host?.acceptSeverity() ?? (severity === 'danger' ? 'danger' : 'primary');

    return this.dialogService.open<ConfirmDialogContentComponent, boolean>(ConfirmDialogContentComponent, {
      header: options.header ?? host?.header(),
      closable: options.closable ?? host?.closable(),
      closeLabel: options.closeLabel ?? host?.closeLabel(),
      position: options.position ?? host?.position(),
      draggable: options.draggable ?? host?.draggable(),
      data: {
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
        messageTemplate: options.messageTemplate ?? host?.messageTemplate() ?? host?.contentTemplate(),
        headlessTemplate: options.headlessTemplate ?? host?.headlessTemplate(),
      },
    });
  }
}
