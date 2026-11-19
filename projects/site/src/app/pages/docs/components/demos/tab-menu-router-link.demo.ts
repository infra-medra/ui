import { Component, signal } from '@angular/core';
import { TabMenuComponent, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-tab-menu-router-link-demo',
  imports: [TabMenuComponent],
  templateUrl: './tab-menu-router-link.demo.html',
})
export class TabMenuRouterLinkDemo {
  protected readonly lastAction = signal('Click an item to navigate.');

  protected readonly items = signal<MenuItem[]>([
    { label: 'Menu', routerLink: '/docs/components/menu', command: () => this.lastAction.set('Opening Menu docs…') },
    { label: 'Menubar', routerLink: ['/docs/components', 'menubar'] },
    // routerLink wins over url when an item has both.
    { label: 'Mega menu', routerLink: '/docs/components/mega-menu', url: 'https://example.com/ignored' },
  ]);
}
