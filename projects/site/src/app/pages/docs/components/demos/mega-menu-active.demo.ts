import { Component, signal } from '@angular/core';
import { MegaMenuComponent, type MegaMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-mega-menu-active-demo',
  imports: [MegaMenuComponent],
  templateUrl: './mega-menu-active.demo.html',
})
export class MegaMenuActiveDemo {
  protected readonly items = signal<MegaMenuItem[]>([
    { label: 'Mega menu', routerLink: '/docs/components/mega-menu' },
    { label: 'Panel menu', routerLink: '/docs/components/panel-menu' },
    { label: 'Tiered menu', routerLink: '/docs/components/tiered-menu' },
    // exact: true — active only on /docs itself, never on a deeper route.
    { label: 'Docs home', routerLink: '/docs', routerLinkActiveOptions: { exact: true } },
  ]);
}
