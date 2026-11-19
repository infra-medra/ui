import { Component, inject, signal } from '@angular/core';
import { ButtonDirective, ConfirmDialogService } from '@medra/ui';

@Component({
  selector: 'app-confirm-dialog-basic-demo',
  imports: [ButtonDirective],
  templateUrl: './confirm-dialog-basic.demo.html',
})
export class ConfirmDialogBasicDemo {
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly result = signal('No decision yet.');

  protected confirmDelete(): void {
    this.confirmDialog
      .confirm({
        header: 'Delete account',
        message: 'This can\'t be undone. Are you sure you want to delete your account?',
        severity: 'danger',
        acceptLabel: 'Delete',
      })
      .closed$.subscribe((accepted) => {
        this.result.set(accepted === undefined ? 'Dismissed.' : accepted ? 'Confirmed — account deleted.' : 'Cancelled.');
      });
  }
}
