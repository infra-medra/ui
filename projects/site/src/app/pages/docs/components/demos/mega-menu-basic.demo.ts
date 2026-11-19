import { Component, signal } from '@angular/core';
import { MegaMenuComponent, type MegaMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-mega-menu-basic-demo',
  imports: [MegaMenuComponent],
  templateUrl: './mega-menu-basic.demo.html',
})
export class MegaMenuBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: MegaMenuItem[] = [
    {
      label: 'Products',
      columns: [
        {
          header: 'Components',
          items: [
            { label: 'Button', command: () => this.lastAction.set('Selected: Button') },
            { label: 'Menu', command: () => this.lastAction.set('Selected: Menu') },
          ],
        },
        {
          header: 'Templates',
          items: [
            { label: 'Dashboard', command: () => this.lastAction.set('Selected: Dashboard') },
            { label: 'Landing page', command: () => this.lastAction.set('Selected: Landing page') },
          ],
        },
      ],
    },
    { label: 'Pricing', command: () => this.lastAction.set('Selected: Pricing') },
  ];
}
