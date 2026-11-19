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
import { GlobalOverlayPosition } from '../overlay/overlay.service';
import { ToastService } from './toast.service';
import { ToastMessage } from './toast.types';

/**
 * Declarative Toast channel host (`TST-01`), supporting `key`-scoped channels
 * (exact `key` matching, `M-04`), `position`, `preventDuplicates`, and
 * `#message` / `#headless` template slots.
 */
@Component({
  selector: 'med-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hidden' },
  template: '',
})
export class ToastComponent implements OnInit, OnDestroy {
  private readonly toastService = inject(ToastService);

  readonly key = input<string | undefined>(undefined);
  readonly position = input<GlobalOverlayPosition | undefined>(undefined);
  readonly preventDuplicates = input(false, { transform: booleanAttribute });

  readonly messageTemplate = contentChild<TemplateRef<{ $implicit: ToastMessage }>>('message');
  readonly headlessTemplate = contentChild<TemplateRef<{ $implicit: ToastMessage; onClose: () => void }>>('headless');

  ngOnInit(): void {
    this.toastService.registerHost(this);
  }

  ngOnDestroy(): void {
    this.toastService.unregisterHost(this);
  }
}
