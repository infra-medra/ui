import { Component, signal } from '@angular/core';
import { MenubarComponent, type MenubarItem } from '@medra/ui';

@Component({
  selector: 'app-menubar-router-link-demo',
  imports: [MenubarComponent],
  templateUrl: './menubar-router-link.demo.html',
})
export class MenubarRouterLinkDemo {
  protected readonly lastAction = signal('Click an item to navigate.');

  protected readonly items = signal<MenubarItem[]>([
    { label: 'Menu', routerLink: '/docs/components/menu', command: () => this.lastAction.set('Opening Menu docs…') },
    { label: 'Menubar', routerLink: ['/docs/components', 'menubar'] },
    // routerLink wins over url when an item has both.
    { label: 'Mega menu', routerLink: '/docs/components/mega-menu', url: 'https://example.com/ignored' },
  ]);
}
