import { Component, computed, signal } from '@angular/core';
import { ButtonDirective, MenubarComponent, type MenubarItem } from '@medra/ui';

@Component({
  selector: 'app-menubar-visible-demo',
  imports: [ButtonDirective, MenubarComponent],
  templateUrl: './menubar-visible.demo.html',
})
export class MenubarVisibleDemo {
  protected readonly showReports = signal(false);

  protected readonly items = computed<MenubarItem[]>(() => [
    { label: 'Dashboard' },
    { label: 'Reports', visible: this.showReports() },
    { label: 'Settings' },
  ]);
}
