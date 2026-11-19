import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  booleanAttribute,
  contentChild,
  inject,
  input,
} from '@angular/core';
import { ButtonSeverity } from '../button/button.styles';
import { MessageSeverity } from '../message/message.styles';
import { ConfirmPopupService } from './confirm-popup.service';
import { ConfirmPopupData } from './confirm-popup.types';

/**
 * Declarative ConfirmPopup host (`CNF-02`), registering key-scoped templates
 * and defaults with `ConfirmPopupService` using exact `key` matching (`M-04`).
 */
@Component({
  selector: 'med-confirm-popup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hidden' },
  template: '',
})
export class ConfirmPopupComponent implements OnInit, OnDestroy {
  private readonly confirmPopupService = inject(ConfirmPopupService);

  /** Targets this host from `ConfirmPopupService.confirm()` calls that pass the same `key`. A call without a key reaches the host that has none. Keys are matched exactly; never build one from user input. */
  readonly key = input<string | undefined>(undefined);
  readonly message = input<string | undefined>(undefined);
  readonly severity = input<MessageSeverity | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);
  readonly acceptLabel = input<string | undefined>(undefined);
  readonly rejectLabel = input<string | undefined>(undefined);
  readonly acceptSeverity = input<ButtonSeverity | undefined>(undefined);
  readonly rejectSeverity = input<ButtonSeverity | undefined>(undefined);
  readonly acceptVisible = input(true, { transform: booleanAttribute });
  readonly rejectVisible = input(true, { transform: booleanAttribute });
  /** Which control gets initial focus. Default: `'reject'`, so pressing Enter right after the popup opens dismisses instead of confirming. */
  readonly defaultFocus = input<'accept' | 'reject' | 'none'>('reject');

  readonly contentTemplate = contentChild<TemplateRef<{ $implicit: ConfirmPopupData }>>('content');
  readonly headlessTemplate = contentChild<
    TemplateRef<{ $implicit: ConfirmPopupData; onAccept: () => void; onReject: () => void }>
  >('headless');

  ngOnInit(): void {
    this.confirmPopupService.registerHost(this);
  }

  ngOnDestroy(): void {
    this.confirmPopupService.unregisterHost(this);
  }
}
