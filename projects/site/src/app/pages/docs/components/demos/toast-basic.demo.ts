import { Component, inject } from '@angular/core';
import { ButtonDirective, ToastService } from '@medra.dev/ui';

@Component({
  selector: 'app-toast-basic-demo',
  imports: [ButtonDirective],
  templateUrl: './toast-basic.demo.html',
})
export class ToastBasicDemo {
  protected readonly toastService = inject(ToastService);
}
