import { Component, inject, signal } from '@angular/core';
import { ButtonDirective, DialogService } from '@medra/ui';
import { DialogContentDemo } from './dialog-content.demo';

@Component({
  selector: 'app-dialog-behavior-demo',
  imports: [ButtonDirective],
  templateUrl: './dialog-behavior.demo.html',
})
export class DialogBehaviorDemo {
  private readonly dialogService = inject(DialogService);
  protected readonly log = signal<string[]>([]);

  protected open(): void {
    const ref = this.dialogService.open<DialogContentDemo, boolean>(DialogContentDemo, {
      header: 'Delete project?',
      closeOnEscape: false,
      dismissableMask: false,
      breakpoints: { '640px': '95vw' },
    });
    ref.opened$.subscribe(() => this.log.update((lines) => [...lines, 'opened$ fired — Escape and the backdrop are both disabled, only the buttons close this one.']));
    ref.closed$.subscribe((result) => this.log.update((lines) => [...lines, `closed$ fired — result: ${result ?? 'undefined'}`]));
  }
}
