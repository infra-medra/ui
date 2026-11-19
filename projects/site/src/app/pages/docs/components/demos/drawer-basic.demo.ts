import { Component, signal } from '@angular/core';
import { ButtonDirective, DrawerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-drawer-basic-demo',
  imports: [ButtonDirective, DrawerComponent],
  templateUrl: './drawer-basic.demo.html',
})
export class DrawerBasicDemo {
  protected readonly visible = signal(false);
}
