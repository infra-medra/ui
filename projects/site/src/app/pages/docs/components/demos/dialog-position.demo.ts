import { Component, signal } from '@angular/core';
import { ButtonDirective, DialogComponent, GlobalOverlayPosition } from '@medra.dev/ui';

@Component({
  selector: 'app-dialog-position-demo',
  imports: [ButtonDirective, DialogComponent],
  templateUrl: './dialog-position.demo.html',
})
export class DialogPositionDemo {
  protected readonly visible = signal(false);
  protected readonly position = signal<GlobalOverlayPosition>('center');

  protected show(position: GlobalOverlayPosition): void {
    this.position.set(position);
    this.visible.set(true);
  }
}
