import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';
import { ConfirmPopupData } from './confirm-popup.types';

/**
 * Internal overlay content for `ConfirmPopupService` (not part of the public
 * API — consumers only ever see `ConfirmPopupService`/`ConfirmPopupOptions`).
 * Same icon + message + Accept/Reject shape as `ConfirmDialogContentComponent`,
 * just resolved via a plain `resolved` output instead of an injected
 * `DIALOG_REF` — this is a connected overlay opened through
 * `OverlayService.openConnected()` directly (like Menu's `MenuPanelComponent`),
 * not routed through `DialogService`'s modal stack, so there's no dialog ref
 * to inject here.
 *
 * The reject button gets initial focus by default (not the accept one) —
 * same "dismissal is the safe default" reasoning native `confirm()`
 * dialogs and most confirmation UIs already use, particularly relevant
 * here since `acceptSeverity` often ends up `danger`. Configurable via
 * `defaultFocus` — `'accept'`/`'reject'`/`'none'` —
 * but the default value itself stays `'reject'`
 * `'accept'`, for the same reasoning.
 *
 * `role="alertdialog"` (the ARIA APG role for a modal-ish confirm/alert
 * prompt, as opposed to plain `dialog`) plus `aria-describedby` pointing at
 * the message paragraph — there's no separate header/title element here
 * (unlike `ConfirmDialogContentComponent`, which has one via
 * `DialogShellComponent`), so the message itself is what the role's
 * accessible description resolves to.
 *
 * **`data().headlessTemplate`/`data().contentTemplate`**
 * — see `ConfirmPopupService`'s own doc for the full reasoning. `headless`
 * takes over completely (icon, message, *and* the button row all
 * skipped); `content` only replaces the icon+message block — the button
 * row stays exactly as it is otherwise.
 */
let nextMessageId = 0;

@Component({
  selector: 'med-confirm-popup-content',
  standalone: true,
  imports: [IconComponent, ButtonDirective, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'alertdialog', '[attr.aria-describedby]': 'messageId' },
  template: `
    @if (data().headlessTemplate; as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: data(), onAccept: accept, onReject: reject }" />
    } @else {
      <div class="flex items-start gap-3">
        @if (data().contentTemplate; as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: data() }" />
        } @else {
          <med-icon [name]="data().iconName" variant="solid" [class]="'size-5 shrink-0 ' + data().iconClass" />
          <p [id]="messageId" class="flex-1 text-sm text-surface-700 dark:text-surface-200">{{ data().message }}</p>
        }
      </div>
      <div class="mt-3 flex justify-end gap-2">
        @if (data().rejectVisible) {
          <button #rejectButton medButton type="button" size="sm" variant="text" [severity]="data().rejectSeverity" (click)="reject()">
            {{ data().rejectLabel }}
          </button>
        }
        @if (data().acceptVisible) {
          <button #acceptButton medButton type="button" size="sm" [severity]="data().acceptSeverity" (click)="accept()">
            {{ data().acceptLabel }}
          </button>
        }
      </div>
    }
  `,
})
export class ConfirmPopupContentComponent implements AfterViewInit {
  readonly data = input.required<ConfirmPopupData>();
  readonly resolved = output<boolean>();

  protected readonly messageId = `med-confirm-popup-message-${nextMessageId++}`;

  private readonly rejectButtonRef = viewChild<ElementRef<HTMLButtonElement>>('rejectButton');
  private readonly acceptButtonRef = viewChild<ElementRef<HTMLButtonElement>>('acceptButton');

  ngAfterViewInit(): void {
    const focus = this.data().defaultFocus;
    if (focus === 'none') {
      return;
    }
    const target = focus === 'accept' ? this.acceptButtonRef() : this.rejectButtonRef();
    // Falls back to whichever button actually exists (visible) if the
    // requested one isn't rendered — e.g. `defaultFocus: 'reject'` with
    // `rejectVisible: false`.
    (target ?? this.acceptButtonRef() ?? this.rejectButtonRef())?.nativeElement.focus();
  }

  protected readonly accept = (): void => this.resolved.emit(true);
  protected readonly reject = (): void => this.resolved.emit(false);
}
