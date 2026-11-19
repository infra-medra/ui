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
import { GlobalOverlayPosition } from '../overlay/overlay.service';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogData } from './confirm-dialog.types';

/**
 * Declarative ConfirmDialog host (`CNF-01`), registering key-scoped templates
 * and defaults with `ConfirmDialogService` using exact `key` matching (`M-04`).
 */
@Component({
  selector: 'med-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hidden' },
  template: '',
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  private readonly confirmDialogService = inject(ConfirmDialogService);

  /** Targets this host from `ConfirmDialogService.confirm()` calls that pass the same `key`. A call without a key reaches the host that has none. Keys are matched exactly; never build one from user input. */
  readonly key = input<string | undefined>(undefined);
  readonly header = input<string | undefined>(undefined);
  readonly message = input<string | undefined>(undefined);
  readonly severity = input<MessageSeverity | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);
  readonly acceptLabel = input<string | undefined>(undefined);
  readonly rejectLabel = input<string | undefined>(undefined);
  readonly acceptSeverity = input<ButtonSeverity | undefined>(undefined);
  readonly rejectSeverity = input<ButtonSeverity | undefined>(undefined);
  readonly acceptVisible = input(true, { transform: booleanAttribute });
  readonly rejectVisible = input(true, { transform: booleanAttribute });
  readonly closable = input(true, { transform: booleanAttribute });
  readonly closeLabel = input<string | undefined>(undefined);
  /** Which control gets initial focus. Default: `'reject'`, so pressing Enter right after the dialog opens dismisses instead of confirming. */
  readonly defaultFocus = input<'accept' | 'reject' | 'close' | 'none'>('reject');
  readonly position = input<GlobalOverlayPosition | undefined>(undefined);
  readonly draggable = input(false, { transform: booleanAttribute });

  readonly contentTemplate = contentChild<TemplateRef<{ $implicit: ConfirmDialogData }>>('content');
  readonly messageTemplate = contentChild<TemplateRef<{ $implicit: ConfirmDialogData }>>('message');
  readonly headlessTemplate = contentChild<
    TemplateRef<{ $implicit: ConfirmDialogData; onAccept: () => void; onReject: () => void }>
  >('headless');

  ngOnInit(): void {
    this.confirmDialogService.registerHost(this);
  }

  ngOnDestroy(): void {
    this.confirmDialogService.unregisterHost(this);
  }
}
