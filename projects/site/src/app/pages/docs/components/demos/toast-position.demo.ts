import { Component, inject } from '@angular/core';
import { ButtonDirective, type GlobalOverlayPosition, ToastService } from '@medra/ui';

@Component({
  selector: 'app-toast-position-demo',
  imports: [ButtonDirective],
  templateUrl: './toast-position.demo.html',
})
export class ToastPositionDemo {
  private readonly toastService = inject(ToastService);

  protected readonly positions: readonly GlobalOverlayPosition[] = [
    'top-left',
    'top',
    'top-right',
    'bottom-left',
    'bottom',
    'bottom-right',
  ];

  protected show(position: GlobalOverlayPosition): void {
    this.toastService.info(`Moved to "${position}".`, { position });
  }
}
