import { Component, inject, signal } from '@angular/core';
import { ButtonDirective, ConfirmPopupService } from '@medra/ui';

@Component({
  selector: 'app-confirm-popup-accept-only-demo',
  imports: [ButtonDirective],
  templateUrl: './confirm-popup-accept-only.demo.html',
})
export class ConfirmPopupAcceptOnlyDemo {
  private readonly confirmPopup = inject(ConfirmPopupService);
  protected readonly result = signal('Not acknowledged yet.');

  protected notify(origin: HTMLElement): void {
    this.confirmPopup
      .confirm(origin, {
        message: 'Your export is ready to download.',
        acceptLabel: 'Got it',
        rejectVisible: false,
        defaultFocus: 'accept',
      })
      ?.closed$.subscribe(() => this.result.set('Acknowledged.'));
  }
}
