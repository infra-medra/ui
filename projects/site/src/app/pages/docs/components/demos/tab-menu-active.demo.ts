import { Component, signal } from '@angular/core';
import { TabMenuComponent, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-tab-menu-active-demo',
  imports: [TabMenuComponent],
  templateUrl: './tab-menu-active.demo.html',
})
export class TabMenuActiveDemo {
  protected readonly items = signal<MenuItem[]>([
    { label: 'Tab menu', routerLink: '/docs/components/tab-menu' },
    { label: 'Menu', routerLink: '/docs/components/menu' },
    { label: 'Menubar', routerLink: '/docs/components/menubar' },
    // exact: true — active only on /docs itself, never on a deeper route.
    { label: 'Docs home', routerLink: '/docs', routerLinkActiveOptions: { exact: true } },
  ]);
}
