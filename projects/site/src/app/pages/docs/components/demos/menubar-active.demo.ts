import { Component, signal } from '@angular/core';
import { MenubarComponent, type MenubarItem } from '@medra.dev/ui';

@Component({
  selector: 'app-menubar-active-demo',
  imports: [MenubarComponent],
  templateUrl: './menubar-active.demo.html',
})
export class MenubarActiveDemo {
  protected readonly items = signal<MenubarItem[]>([
    { label: 'Menubar', routerLink: '/docs/components/menubar' },
    { label: 'Mega menu', routerLink: '/docs/components/mega-menu' },
    { label: 'Panel menu', routerLink: '/docs/components/panel-menu' },
    // exact: true — active only on /docs itself, never on a deeper route.
    { label: 'Docs home', routerLink: '/docs', routerLinkActiveOptions: { exact: true } },
  ]);
}
