import { Component, inject } from '@angular/core';
import { ButtonDirective, DialogService } from '@medra.dev/ui';
import { DialogContentDemo } from './dialog-content.demo';

@Component({
  selector: 'app-dialog-resizable-demo',
  imports: [ButtonDirective],
  templateUrl: './dialog-resizable.demo.html',
})
export class DialogResizableDemo {
  private readonly dialogService = inject(DialogService);

  protected open(): void {
    this.dialogService.open<DialogContentDemo, boolean>(DialogContentDemo, {
      header: 'Resizable Dialog',
      resizable: true,
    });
  }
}
