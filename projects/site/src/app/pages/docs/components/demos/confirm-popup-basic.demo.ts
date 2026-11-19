import { Component, inject, signal } from '@angular/core';
import { ButtonDirective, ConfirmPopupService } from '@medra.dev/ui';

@Component({
  selector: 'app-confirm-popup-basic-demo',
  imports: [ButtonDirective],
  templateUrl: './confirm-popup-basic.demo.html',
})
export class ConfirmPopupBasicDemo {
  private readonly confirmPopup = inject(ConfirmPopupService);
  protected readonly result = signal('No decision yet.');

  protected confirmDelete(origin: HTMLElement): void {
    this.confirmPopup.confirm(origin, { message: 'Delete this row?', severity: 'danger' })?.closed$.subscribe((accepted) => {
      this.result.set(accepted === undefined ? 'Dismissed.' : accepted ? 'Confirmed — row deleted.' : 'Cancelled.');
    });
  }
}
