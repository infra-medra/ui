import { Component, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { ButtonDirective, type ConfirmDialogData, ConfirmDialogService, IconComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-confirm-dialog-headless-demo',
  imports: [ButtonDirective, IconComponent],
  templateUrl: './confirm-dialog-headless.demo.html',
})
export class ConfirmDialogHeadlessDemo {
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly result = signal('No decision yet.');

  @ViewChild('headlessTpl')
  protected headlessTpl!: TemplateRef<{ $implicit: ConfirmDialogData; onAccept: () => void; onReject: () => void }>;

  protected confirmHeadless(): void {
    this.confirmDialog
      .confirm({
        message: 'Enjoying MedraUi so far?',
        headlessTemplate: this.headlessTpl,
      })
      .closed$.subscribe((accepted) => {
        this.result.set(accepted === undefined ? 'Dismissed.' : accepted ? 'Accepted — rate now.' : 'Rejected — maybe later.');
      });
  }
}
