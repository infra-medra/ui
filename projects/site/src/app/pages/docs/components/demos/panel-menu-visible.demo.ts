import { Component, computed, signal } from '@angular/core';
import { ButtonDirective, PanelMenuComponent, type TieredMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-panel-menu-visible-demo',
  imports: [ButtonDirective, PanelMenuComponent],
  templateUrl: './panel-menu-visible.demo.html',
})
export class PanelMenuVisibleDemo {
  protected readonly showReports = signal(false);

  protected readonly items = computed<TieredMenuItem[]>(() => [
    { label: 'Dashboard' },
    { label: 'Reports', visible: this.showReports() },
    { label: 'Settings' },
  ]);
}
