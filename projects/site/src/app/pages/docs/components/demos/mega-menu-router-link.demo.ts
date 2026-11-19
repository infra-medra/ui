import { Component, signal } from '@angular/core';
import { MegaMenuComponent, type MegaMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-mega-menu-router-link-demo',
  imports: [MegaMenuComponent],
  templateUrl: './mega-menu-router-link.demo.html',
})
export class MegaMenuRouterLinkDemo {
  protected readonly lastAction = signal('Click an item to navigate.');

  protected readonly items = signal<MegaMenuItem[]>([
    { label: 'Menu', routerLink: '/docs/components/menu', command: () => this.lastAction.set('Opening Menu docs…') },
    { label: 'Menubar', routerLink: ['/docs/components', 'menubar'] },
    // routerLink wins over url when an item has both.
    { label: 'Mega menu', routerLink: '/docs/components/mega-menu', url: 'https://example.com/ignored' },
  ]);
}
