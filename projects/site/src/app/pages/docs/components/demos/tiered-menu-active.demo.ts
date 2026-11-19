import { Component, signal } from '@angular/core';
import { TieredMenuComponent, type TieredMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-tiered-menu-active-demo',
  imports: [TieredMenuComponent],
  templateUrl: './tiered-menu-active.demo.html',
})
export class TieredMenuActiveDemo {
  protected readonly items = signal<TieredMenuItem[]>([
    { label: 'Tiered menu', routerLink: '/docs/components/tiered-menu' },
    { label: 'Tab menu', routerLink: '/docs/components/tab-menu' },
    { label: 'Menu', routerLink: '/docs/components/menu' },
    // exact: true — active only on /docs itself, never on a deeper route.
    { label: 'Docs home', routerLink: '/docs', routerLinkActiveOptions: { exact: true } },
  ]);
}
