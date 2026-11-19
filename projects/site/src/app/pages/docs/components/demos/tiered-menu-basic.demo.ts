import { Component, signal } from '@angular/core';
import { ButtonDirective, TieredMenuComponent, type TieredMenuItem } from '@medra/ui';

@Component({
  selector: 'app-tiered-menu-basic-demo',
  imports: [ButtonDirective, TieredMenuComponent],
  templateUrl: './tiered-menu-basic.demo.html',
})
export class TieredMenuBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: TieredMenuItem[] = [
    { label: 'New', command: () => this.lastAction.set('Selected: New') },
    {
      label: 'Export',
      items: [
        { label: 'PDF', command: () => this.lastAction.set('Selected: Export > PDF') },
        { label: 'CSV', command: () => this.lastAction.set('Selected: Export > CSV') },
        {
          label: 'Image',
          items: [
            { label: 'PNG', command: () => this.lastAction.set('Selected: Export > Image > PNG') },
            { label: 'SVG', command: () => this.lastAction.set('Selected: Export > Image > SVG') },
          ],
        },
      ],
    },
    { separator: true },
    { label: 'Delete', command: () => this.lastAction.set('Selected: Delete') },
  ];
}
