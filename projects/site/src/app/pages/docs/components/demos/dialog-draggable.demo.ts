import { Component, inject } from '@angular/core';
import { ButtonDirective, DialogService } from '@medra.dev/ui';
import { DialogContentDemo } from './dialog-content.demo';

@Component({
  selector: 'app-dialog-draggable-demo',
  imports: [ButtonDirective],
  templateUrl: './dialog-draggable.demo.html',
})
export class DialogDraggableDemo {
  private readonly dialogService = inject(DialogService);

  protected open(): void {
    this.dialogService.open<DialogContentDemo, boolean>(DialogContentDemo, {
      header: 'Draggable Dialog',
      draggable: true,
    });
  }
}
