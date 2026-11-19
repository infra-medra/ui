import { Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { ButtonDirective, type ToastMessage, ToastService } from '@medra/ui';

@Component({
  selector: 'app-toast-message-demo',
  imports: [ButtonDirective],
  templateUrl: './toast-message.demo.html',
})
export class ToastMessageDemo {
  private readonly toastService = inject(ToastService);

  @ViewChild('messageTpl')
  protected messageTpl!: TemplateRef<{ $implicit: ToastMessage }>;

  protected show(): void {
    this.toastService.show({ severity: 'info', detail: 'Fallback text (unused here)', messageTemplate: this.messageTpl });
  }
}
