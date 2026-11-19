import { Component, inject, signal } from '@angular/core';
import { ButtonDirective, ConfirmDialogService } from '@medra/ui';

@Component({
  selector: 'app-confirm-dialog-draggable-demo',
  imports: [ButtonDirective],
  templateUrl: './confirm-dialog-draggable.demo.html',
})
export class ConfirmDialogDraggableDemo {
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly result = signal('No decision yet.');

  protected confirmRestart(): void {
    this.confirmDialog
      .confirm({
        header: 'Restart service',
        message: 'This will disconnect every active session for about 30 seconds.',
        position: 'top',
        draggable: true,
        rejectVisible: false,
        acceptLabel: 'Restart',
        defaultFocus: 'accept',
      })
      .closed$.subscribe((accepted) => {
        this.result.set(accepted === undefined ? 'Dismissed.' : 'Restarting…');
      });
  }
}
