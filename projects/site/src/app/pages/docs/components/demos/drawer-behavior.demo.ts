import { Component, signal } from '@angular/core';
import { ButtonDirective, DrawerComponent } from '@medra/ui';

@Component({
  selector: 'app-drawer-behavior-demo',
  imports: [ButtonDirective, DrawerComponent],
  templateUrl: './drawer-behavior.demo.html',
})
export class DrawerBehaviorDemo {
  protected readonly fullScreenVisible = signal(false);
  protected readonly lockedVisible = signal(false);
}
