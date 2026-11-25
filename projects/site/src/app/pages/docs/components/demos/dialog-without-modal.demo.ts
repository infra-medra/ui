import { Component, signal } from '@angular/core';
import { ButtonDirective, DialogComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-dialog-without-modal-demo',
  imports: [ButtonDirective, DialogComponent],
  templateUrl: './dialog-without-modal.demo.html',
})
export class DialogWithoutModalDemo {
  protected readonly visible = signal(false);
  protected readonly outsideClicks = signal(0);

  protected incrementOutside(): void {
    this.outsideClicks.update((count) => count + 1);
  }
}
