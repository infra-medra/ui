import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MessageComponent } from '../message/message.component';
import { ToastMessage } from './toast.types';

/**
 * Internal: a single persistent container that stacks active toast
 * messages. Created once (lazily) by `ToastService` via `OverlayService`,
 * never disposed for the lifetime of the app. Not part of the public API.
 *
 * **`message.messageTemplate`/`message.headlessTemplate`** — see `ToastService`'s own doc. `headless` skips `<med-message>`
 * entirely (no chrome, no close button — the projected template supplies
 * its own, wired to `onClose`); `message` renders inside `<med-message>`
 * as usual (icon, severity color, close button all still apply) but
 * replaces the summary/detail paragraphs with the projected content.
 */
@Component({
  selector: 'med-toast-container',
  standalone: true,
  imports: [MessageComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // No `fixed` here: the CDK overlay pane this hosts inside is already
  // positioned fixed at the viewport corner by OverlayService. Adding a
  // second `position: fixed` on this element re-establishes positioning
  // relative to the viewport from scratch with no coordinates set, which
  // pushed the whole toast stack off-screen to the right.
  host: {
    class: 'pointer-events-none flex w-full max-w-sm flex-col gap-2 p-4 sm:w-auto',
    role: 'region',
    'aria-live': 'polite',
  },
  template: `
    @for (message of messages(); track message.id) {
      @if (message.headlessTemplate; as tpl) {
        <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: message, onClose: closeCallback(message.id) }" />
      } @else {
        <med-message
          class="pointer-events-auto shadow-overlay-sm"
          [severity]="message.severity"
          [closable]="message.closable"
          [closeLabel]="message.closeLabel"
          (closed)="dismiss(message.id)"
        >
          @if (message.messageTemplate; as tpl) {
            <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: message }" />
          } @else {
            @if (message.summary) {
              <p class="font-semibold">{{ message.summary }}</p>
            }
            @if (message.detail) {
              <p>{{ message.detail }}</p>
            }
          }
        </med-message>
      }
    }
  `,
})
export class ToastContainerComponent {
  private readonly messagesSignal = signal<ToastMessage[]>([]);
  protected readonly messages = this.messagesSignal.asReadonly();
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  push(message: ToastMessage): void {
    this.messagesSignal.update((list) => [...list, message]);
    if (message.life > 0) {
      const timer = setTimeout(() => this.dismiss(message.id), message.life);
      this.timers.set(message.id, timer);
    }
  }

  /** Bound `dismiss(id)` closure for a `headlessTemplate`'s `onClose` context — one per message, not memoized (the message list is short-lived and typically small). */
  protected closeCallback(id: number): () => void {
    return () => this.dismiss(id);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.messagesSignal.update((list) => list.filter((m) => m.id !== id));
  }

  hasDuplicate(candidate: Pick<ToastMessage, 'key' | 'severity' | 'summary' | 'detail'>): boolean {
    return this.messagesSignal().some(
      (m) =>
        m.key === candidate.key &&
        m.severity === candidate.severity &&
        m.summary === candidate.summary &&
        m.detail === candidate.detail,
    );
  }

  clear(key?: string): void {
    if (key === undefined) {
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      this.timers.clear();
      this.messagesSignal.set([]);
      return;
    }

    for (const msg of this.messagesSignal()) {
      if (msg.key === key) {
        const timer = this.timers.get(msg.id);
        if (timer !== undefined) {
          clearTimeout(timer);
          this.timers.delete(msg.id);
        }
      }
    }
    this.messagesSignal.update((list) => list.filter((m) => m.key !== key));
  }
}
