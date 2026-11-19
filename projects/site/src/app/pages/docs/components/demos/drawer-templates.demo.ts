import { Component, signal } from '@angular/core';
import { ButtonDirective, DrawerComponent, IconComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-drawer-templates-demo',
  imports: [ButtonDirective, DrawerComponent, IconComponent],
  templateUrl: './drawer-templates.demo.html',
})
export class DrawerTemplatesDemo {
  protected readonly headerFooterVisible = signal(false);
  protected readonly headlessVisible = signal(false);
}
