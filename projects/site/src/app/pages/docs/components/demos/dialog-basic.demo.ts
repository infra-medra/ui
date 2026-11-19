import { Component, inject, signal } from '@angular/core';
import { ButtonDirective, DialogService } from '@medra.dev/ui';
import { DialogContentDemo } from './dialog-content.demo';

@Component({
  selector: 'app-dialog-basic-demo',
  imports: [ButtonDirective],
  templateUrl: './dialog-basic.demo.html',
})
export class DialogBasicDemo {
  private readonly dialogService = inject(DialogService);
  protected readonly lastResult = signal<boolean | null>(null);

  protected openDialog(): void {
    this.dialogService
      .open<DialogContentDemo, boolean>(DialogContentDemo, { header: 'Delete project?' })
      .closed$.subscribe((result) => this.lastResult.set(result ?? false));
  }
}
