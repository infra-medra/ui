import { Component, signal } from '@angular/core';
import { ButtonDirective, DrawerComponent } from '@medra/ui';

@Component({
  selector: 'app-drawer-modal-demo',
  imports: [ButtonDirective, DrawerComponent],
  templateUrl: './drawer-modal.demo.html',
})
export class DrawerModalDemo {
  protected readonly visible = signal(false);
}
