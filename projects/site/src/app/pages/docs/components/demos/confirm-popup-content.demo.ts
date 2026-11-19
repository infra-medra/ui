import { Component, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { ButtonDirective, type ConfirmPopupData, ConfirmPopupService, IconComponent } from '@medra/ui';

@Component({
  selector: 'app-confirm-popup-content-demo',
  imports: [ButtonDirective, IconComponent],
  templateUrl: './confirm-popup-content.demo.html',
})
export class ConfirmPopupContentDemo {
  private readonly confirmPopup = inject(ConfirmPopupService);
  protected readonly result = signal('No decision yet.');

  @ViewChild('contentTpl')
  protected contentTpl!: TemplateRef<{ $implicit: ConfirmPopupData }>;

  protected confirmLeave(origin: HTMLElement): void {
    this.confirmPopup
      .confirm(origin, { message: 'Fallback text (unused here)', contentTemplate: this.contentTpl })
      ?.closed$.subscribe((accepted) => {
        this.result.set(accepted === undefined ? 'Dismissed.' : accepted ? 'Confirmed — left the page.' : 'Cancelled.');
      });
  }
}
