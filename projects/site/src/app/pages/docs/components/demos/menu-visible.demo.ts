import { Component, computed, signal } from '@angular/core';
import { ButtonDirective, MenuComponent, type MenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-menu-visible-demo',
  imports: [ButtonDirective, MenuComponent],
  templateUrl: './menu-visible.demo.html',
})
export class MenuVisibleDemo {
  protected readonly showReports = signal(false);

  protected readonly items = computed<MenuItem[]>(() => [
    { label: 'Dashboard' },
    { label: 'Reports', visible: this.showReports() },
    { label: 'Settings' },
  ]);
}
