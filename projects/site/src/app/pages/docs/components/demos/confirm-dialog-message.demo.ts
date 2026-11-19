import { Component, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { ButtonDirective, type ConfirmDialogData, ConfirmDialogService } from '@medra.dev/ui';

@Component({
  selector: 'app-confirm-dialog-message-demo',
  imports: [ButtonDirective],
  templateUrl: './confirm-dialog-message.demo.html',
})
export class ConfirmDialogMessageDemo {
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly result = signal('No decision yet.');

  @ViewChild('messageTpl')
  protected messageTpl!: TemplateRef<{ $implicit: ConfirmDialogData }>;

  protected confirmDelete(): void {
    this.confirmDialog
      .confirm({
        header: 'Delete workspace',
        message: 'Fallback text (unused here)',
        severity: 'danger',
        acceptLabel: 'Delete',
        messageTemplate: this.messageTpl,
      })
      .closed$.subscribe((accepted) => {
        this.result.set(accepted === undefined ? 'Dismissed.' : accepted ? 'Confirmed — workspace deleted.' : 'Cancelled.');
      });
  }
}
