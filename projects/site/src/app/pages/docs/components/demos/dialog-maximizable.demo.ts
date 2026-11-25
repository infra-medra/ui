import { Component, signal } from '@angular/core';
import { ButtonDirective, DialogComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-dialog-maximizable-demo',
  imports: [ButtonDirective, DialogComponent],
  templateUrl: './dialog-maximizable.demo.html',
})
export class DialogMaximizableDemo {
  protected readonly visible = signal(false);
}
