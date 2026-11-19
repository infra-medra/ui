import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';
import { DIALOG_DATA, DIALOG_REF, DialogRef } from '../dialog/dialog.tokens';
import { ConfirmDialogData } from './confirm-dialog.types';

/**
 * Internal dialog content for `ConfirmDialogService` (not part of the public
 * API — consumers only ever see `ConfirmDialogService`/`ConfirmDialogOptions`).
 * Hosted inside `DialogShellComponent` exactly like any consumer-supplied
 * dialog content (see `dialog.service.ts`) — `ConfirmDialogService` is a thin
 * convenience wrapper over `DialogService`, not a second overlay
 * implementation. `dialogRef.close(true/false)` on Accept/Reject; Esc,
 * backdrop click, or the header close button all resolve to `undefined`
 * (dismissed) via `DialogShellComponent`'s own close button / `OverlayService`'s
 * Escape/backdrop handling — never routed through this component at all.
 *
 * The reject button gets initial focus by default (not the accept one), for
 * consistency with `ConfirmPopupContentComponent`'s own Reject-default —
 * same "dismissal is the safe default" reasoning: an accidental Enter-press
 * lands on Reject, not on an `acceptSeverity: 'danger'` action.
 * `DialogShellComponent`'s host also runs a focus trap
 * (`OverlayService.openWithStrategy` /
 * `FocusTrapFactory.focusInitialElementWhenReady()`), which independently
 * focuses the first tabbable element inside the trap zone once the view is
 * stable — the reject button being first in DOM order makes that trap
 * behavior agree with this deliberate `focus()` call rather than fight it,
 * but this call is what makes the choice explicit and tested instead of an
 * accident of markup order.
 *
 * **`defaultFocus`** makes that choice configurable —
 * `'accept'`/`'reject'`/`'close'`/`'none'` — but the default value itself
 * stays `'reject'`, for the reasoning above.
 * `'close'` targets the header close button, which lives in
 * `DialogShellComponent` — a sibling in the rendered DOM, not a child this
 * component can query directly, since the two are separate dynamically-
 * created component instances (the shell hosts this content component via
 * `ViewContainerRef.createComponent()`, see `dialog-shell.component.ts`).
 * Reached via a plain DOM query (`closest('med-dialog-shell')`) for the
 * shell's own `[data-dialog-close]` marker — a small, deliberate escape
 * hatch across that component boundary rather than plumbing a new
 * cross-component API just for this one focus target.
 *
 * **`data.headlessTemplate`/`data.messageTemplate`** —
 * see `ConfirmDialogService`'s own doc for the full reasoning. `headless`
 * takes over completely (icon, message, *and* the button row all skipped)
 * so the projected template can lay out anything, including its own
 * accept/reject controls, wired to the `onAccept`/`onReject` callbacks in
 * its context. `message` only replaces the `<p>` — the icon and buttons
 * stay exactly as they are otherwise.
 */
@Component({
  selector: 'med-confirm-dialog-content',
  standalone: true,
  imports: [IconComponent, ButtonDirective, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data.headlessTemplate; as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: data, onAccept: accept, onReject: reject }" />
    } @else {
      <div class="flex items-start gap-3">
        <med-icon [name]="data.iconName" variant="solid" [class]="'size-6 shrink-0 ' + data.iconClass" />
        @if (data.messageTemplate; as tpl) {
          <div class="flex-1 text-sm text-surface-700 dark:text-surface-200">
            <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: data }" />
          </div>
        } @else {
          <p class="flex-1 text-sm text-surface-700 dark:text-surface-200">{{ data.message }}</p>
        }
      </div>
      <div class="mt-4 flex justify-end gap-2">
        @if (data.rejectVisible) {
          <button #rejectButton medButton type="button" variant="text" [severity]="data.rejectSeverity" (click)="reject()">
            {{ data.rejectLabel }}
          </button>
        }
        @if (data.acceptVisible) {
          <button #acceptButton medButton type="button" [severity]="data.acceptSeverity" (click)="accept()">
            {{ data.acceptLabel }}
          </button>
        }
      </div>
    }
  `,
})
export class ConfirmDialogContentComponent implements AfterViewInit {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly dialogRef = inject<DialogRef<boolean>>(DIALOG_REF);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly rejectButtonRef = viewChild<ElementRef<HTMLButtonElement>>('rejectButton');
  private readonly acceptButtonRef = viewChild<ElementRef<HTMLButtonElement>>('acceptButton');

  ngAfterViewInit(): void {
    const focus = this.data.defaultFocus;
    if (focus === 'none') {
      return;
    }
    if (focus === 'close') {
      this.elementRef.nativeElement.closest('med-dialog-shell')?.querySelector<HTMLElement>('[data-dialog-close]')?.focus();
      return;
    }
    const target = focus === 'accept' ? this.acceptButtonRef() : this.rejectButtonRef();
    // Falls back to whichever button actually exists (visible) if the
    // requested one isn't rendered — e.g. `defaultFocus: 'reject'` with
    // `rejectVisible: false`.
    (target ?? this.acceptButtonRef() ?? this.rejectButtonRef())?.nativeElement.focus();
  }

  protected readonly accept = (): void => this.dialogRef.close(true);
  protected readonly reject = (): void => this.dialogRef.close(false);
}
