import { Component, computed, signal } from '@angular/core';
import { ButtonDirective, TieredMenuComponent, type TieredMenuItem } from '@medra/ui';

@Component({
  selector: 'app-tiered-menu-visible-demo',
  imports: [ButtonDirective, TieredMenuComponent],
  templateUrl: './tiered-menu-visible.demo.html',
})
export class TieredMenuVisibleDemo {
  protected readonly showReports = signal(false);

  protected readonly items = computed<TieredMenuItem[]>(() => [
    { label: 'Dashboard' },
    { label: 'Reports', visible: this.showReports() },
    { label: 'Settings' },
  ]);
}
