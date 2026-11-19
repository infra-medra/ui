import { Component, computed, signal } from '@angular/core';
import { ButtonDirective, TabMenuComponent, type MenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-tab-menu-visible-demo',
  imports: [ButtonDirective, TabMenuComponent],
  templateUrl: './tab-menu-visible.demo.html',
})
export class TabMenuVisibleDemo {
  protected readonly showReports = signal(false);

  protected readonly items = computed<MenuItem[]>(() => [
    { label: 'Dashboard' },
    { label: 'Reports', visible: this.showReports() },
    { label: 'Settings' },
  ]);
}
