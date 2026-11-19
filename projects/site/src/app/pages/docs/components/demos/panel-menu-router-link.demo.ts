import { Component, signal } from '@angular/core';
import { PanelMenuComponent, type TieredMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-panel-menu-router-link-demo',
  imports: [PanelMenuComponent],
  templateUrl: './panel-menu-router-link.demo.html',
})
export class PanelMenuRouterLinkDemo {
  protected readonly lastAction = signal('Click an item to navigate.');

  protected readonly items = signal<TieredMenuItem[]>([
    { label: 'Menu', routerLink: '/docs/components/menu', command: () => this.lastAction.set('Opening Menu docs…') },
    { label: 'Menubar', routerLink: ['/docs/components', 'menubar'] },
    // routerLink wins over url when an item has both.
    { label: 'Mega menu', routerLink: '/docs/components/mega-menu', url: 'https://example.com/ignored' },
  ]);
}
