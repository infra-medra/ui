import { ComponentRef, Injectable, inject } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { GlobalOverlayPosition, OverlayService } from '../overlay/overlay.service';
import type { ToastComponent } from './toast.component';
import { ToastContainerComponent } from './toast-container.component';
import { ToastOptions } from './toast.types';

const DEFAULT_POSITION: GlobalOverlayPosition = 'top-right';

/**
 * Toast primitive (Trilha 3, pilot #5 — the ephemeral half of "Message/Toast").
 * Imperative service, same shape as Dialog's. Reuses OverlayService with a
 * non-centered position and no backdrop/focus-trap/outside-click-closes —
 * a toast stack must not block or get dismissed by interaction with the
 * rest of the page, only by its own timer or close button.
 *
 * There is exactly one shared container/stack for the whole app (matching
 * how this service is actually used — one imperative call site per toast,
 * never a `<med-toast position="...">` placed per-instance in a template).
 * `position` therefore isn't a per-message property in practice: the first
 * `show()`/`info()`/etc. call ever made picks where the stack lives
 * (default `'top-right'`), and a later call with a *different* `position`
 * relocates that same stack in place (`OverlayService.repositionGlobal`)
 * rather than opening a second, independent one — existing messages and
 * their timers stay untouched.
 *
 * **`messageTemplate`/`headlessTemplate`**: the same `TemplateRef`-passed-as-option mechanism
 * `ConfirmDialogService`/`ConfirmPopupService` use, see `ConfirmDialogService`'s own doc for the
 * full reasoning behind that pattern. This service's architecture is fully imperative (one call per
 * toast, a single shared container), so per-call options are the closer fit: each
 * `show()`/`info()`/etc. call can carry its own template, applied to just that one message, not the
 * whole stack. See `ToastOptions`' own doc for the exact context shapes.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly overlayService = inject(OverlayService);
  private containerRef: ComponentRef<ToastContainerComponent> | null = null;
  private overlayRef: OverlayRef | null = null;
  private currentPosition = DEFAULT_POSITION;
  private nextId = 0;
  private readonly hosts = new Set<ToastComponent>();

  /** @internal */
  registerHost(host: ToastComponent): void {
    this.hosts.add(host);
  }

  /** @internal */
  unregisterHost(host: ToastComponent): void {
    this.hosts.delete(host);
  }

  private findHost(key?: string): ToastComponent | undefined {
    for (const host of this.hosts) {
      if (host.key() === key) {
        return host;
      }
    }
    return undefined;
  }

  add(options: ToastOptions = {}): number {
    return this.show(options);
  }

  show(options: ToastOptions = {}): number {
    const host = this.findHost(options.key);
    if (this.hosts.size > 0 && !host) {
      return -1;
    }

    const container = this.ensureContainer(options.position ?? host?.position());
    const severity = options.severity ?? 'info';
    const preventDuplicates = options.preventDuplicates ?? host?.preventDuplicates() ?? false;
    if (
      preventDuplicates &&
      container.hasDuplicate({
        key: options.key,
        severity,
        summary: options.summary,
        detail: options.detail,
      })
    ) {
      return -1;
    }

    const id = this.nextId++;
    const sticky = options.sticky ?? false;
    container.push({
      id,
      key: options.key,
      sticky,
      severity,
      summary: options.summary,
      detail: options.detail,
      life: sticky ? 0 : (options.life ?? 3000),
      closable: options.closable ?? true,
      closeLabel: options.closeLabel ?? 'Close',
      messageTemplate: options.messageTemplate ?? host?.messageTemplate(),
      headlessTemplate: options.headlessTemplate ?? host?.headlessTemplate(),
    });
    return id;
  }

  info(detail: string, options: Omit<ToastOptions, 'severity' | 'detail'> = {}): number {
    return this.show({ ...options, severity: 'info', detail });
  }

  success(detail: string, options: Omit<ToastOptions, 'severity' | 'detail'> = {}): number {
    return this.show({ ...options, severity: 'success', detail });
  }

  warn(detail: string, options: Omit<ToastOptions, 'severity' | 'detail'> = {}): number {
    return this.show({ ...options, severity: 'warn', detail });
  }

  error(detail: string, options: Omit<ToastOptions, 'severity' | 'detail'> = {}): number {
    return this.show({ ...options, severity: 'danger', detail });
  }

  dismiss(id: number): void {
    this.containerRef?.instance.dismiss(id);
  }

  clear(key?: string): void {
    this.containerRef?.instance.clear(key);
  }

  private ensureContainer(requestedPosition?: GlobalOverlayPosition): ToastContainerComponent {
    if (!this.containerRef) {
      this.currentPosition = requestedPosition ?? this.currentPosition;
      const handle = this.overlayService.openGlobal(ToastContainerComponent, {
        position: this.currentPosition,
        hasBackdrop: false,
        closeOnEscape: false,
        closeOnOutsideClick: false,
        panelClass: [],
      });
      this.overlayRef = handle.overlayRef;
      this.containerRef = handle.componentRef;
    } else if (requestedPosition && requestedPosition !== this.currentPosition) {
      this.currentPosition = requestedPosition;
      this.overlayService.repositionGlobal(this.overlayRef!, requestedPosition);
    }
    return this.containerRef.instance;
  }
}
