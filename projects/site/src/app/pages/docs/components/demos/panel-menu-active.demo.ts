import { Component, signal } from '@angular/core';
import { PanelMenuComponent, type TieredMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-panel-menu-active-demo',
  imports: [PanelMenuComponent],
  templateUrl: './panel-menu-active.demo.html',
})
export class PanelMenuActiveDemo {
  protected readonly items = signal<TieredMenuItem[]>([
    { label: 'Panel menu', routerLink: '/docs/components/panel-menu' },
    { label: 'Tiered menu', routerLink: '/docs/components/tiered-menu' },
    { label: 'Tab menu', routerLink: '/docs/components/tab-menu' },
    // exact: true — active only on /docs itself, never on a deeper route.
    { label: 'Docs home', routerLink: '/docs', routerLinkActiveOptions: { exact: true } },
  ]);
}
