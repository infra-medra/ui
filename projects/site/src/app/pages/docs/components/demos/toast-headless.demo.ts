import { Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { ButtonDirective, IconComponent, type ToastMessage, ToastService } from '@medra/ui';

@Component({
  selector: 'app-toast-headless-demo',
  imports: [ButtonDirective, IconComponent],
  templateUrl: './toast-headless.demo.html',
})
export class ToastHeadlessDemo {
  private readonly toastService = inject(ToastService);

  @ViewChild('headlessTpl')
  protected headlessTpl!: TemplateRef<{ $implicit: ToastMessage; onClose: () => void }>;

  protected showHeadless(): void {
    this.toastService.show({ detail: 'Custom pill-shaped toast.', headlessTemplate: this.headlessTpl });
  }
}
