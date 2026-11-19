import { Component, inject } from '@angular/core';
import { ButtonDirective, DialogService } from '@medra.dev/ui';
import { DialogContentDemo } from './dialog-content.demo';

@Component({
  selector: 'app-dialog-window-controls-demo',
  imports: [ButtonDirective],
  templateUrl: './dialog-window-controls.demo.html',
})
export class DialogWindowControlsDemo {
  private readonly dialogService = inject(DialogService);

  protected open(): void {
    this.dialogService.open<DialogContentDemo, boolean>(DialogContentDemo, {
      header: 'Delete project?',
      draggable: true,
      resizable: true,
      maximizable: true,
    });
  }
}
