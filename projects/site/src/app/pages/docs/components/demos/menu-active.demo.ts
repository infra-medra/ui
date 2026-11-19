import { Component, signal } from '@angular/core';
import { MenuComponent, type MenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-menu-active-demo',
  imports: [MenuComponent],
  templateUrl: './menu-active.demo.html',
})
export class MenuActiveDemo {
  protected readonly items = signal<MenuItem[]>([
    { label: 'Menu', routerLink: '/docs/components/menu' },
    { label: 'Menubar', routerLink: '/docs/components/menubar' },
    { label: 'Mega menu', routerLink: '/docs/components/mega-menu' },
    // exact: true — active only on /docs itself, never on a deeper route.
    { label: 'Docs home', routerLink: '/docs', routerLinkActiveOptions: { exact: true } },
  ]);
}
