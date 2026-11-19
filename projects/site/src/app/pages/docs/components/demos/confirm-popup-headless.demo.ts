import { Component, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { ButtonDirective, type ConfirmPopupData, ConfirmPopupService } from '@medra/ui';

@Component({
  selector: 'app-confirm-popup-headless-demo',
  imports: [ButtonDirective],
  templateUrl: './confirm-popup-headless.demo.html',
})
export class ConfirmPopupHeadlessDemo {
  private readonly confirmPopup = inject(ConfirmPopupService);
  protected readonly result = signal('No decision yet.');

  @ViewChild('headlessTpl')
  protected headlessTpl!: TemplateRef<{ $implicit: ConfirmPopupData; onAccept: () => void; onReject: () => void }>;

  protected confirmHeadless(origin: HTMLElement): void {
    this.confirmPopup
      .confirm(origin, { message: '1 item will be moved.', headlessTemplate: this.headlessTpl })
      ?.closed$.subscribe((accepted) => {
        this.result.set(accepted === undefined ? 'Dismissed.' : accepted ? 'Accepted — archived.' : 'Rejected — cancelled.');
      });
  }
}
