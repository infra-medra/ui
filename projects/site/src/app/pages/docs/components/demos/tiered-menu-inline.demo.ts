import { Component, signal } from '@angular/core';
import { TieredMenuComponent, type TieredMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-tiered-menu-inline-demo',
  imports: [TieredMenuComponent],
  templateUrl: './tiered-menu-inline.demo.html',
})
export class TieredMenuInlineDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: TieredMenuItem[] = [
    { label: 'New', command: () => this.lastAction.set('Selected: New') },
    {
      label: 'Export',
      items: [
        { label: 'PDF', command: () => this.lastAction.set('Selected: Export > PDF') },
        { label: 'CSV', command: () => this.lastAction.set('Selected: Export > CSV') },
      ],
    },
    { separator: true },
    { label: 'Delete', command: () => this.lastAction.set('Selected: Delete') },
  ];
}
