import { Component, computed, signal } from '@angular/core';
import { ButtonDirective, MegaMenuComponent, type MegaMenuItem } from '@medra/ui';

@Component({
  selector: 'app-mega-menu-visible-demo',
  imports: [ButtonDirective, MegaMenuComponent],
  templateUrl: './mega-menu-visible.demo.html',
})
export class MegaMenuVisibleDemo {
  protected readonly showReports = signal(false);

  protected readonly items = computed<MegaMenuItem[]>(() => [
    { label: 'Dashboard' },
    { label: 'Reports', visible: this.showReports() },
    { label: 'Settings' },
  ]);
}
