import { Component, signal } from '@angular/core';
import { PanelMenuComponent, type MenuItem, type TieredMenuItem } from '@medra/ui';

@Component({
  selector: 'app-panel-menu-basic-demo',
  imports: [PanelMenuComponent],
  templateUrl: './panel-menu-basic.demo.html',
})
export class PanelMenuBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: TieredMenuItem[] = [
    { label: 'Dashboard', command: () => this.lastAction.set('Selected: Dashboard') },
    {
      label: 'Settings',
      items: [
        { label: 'Profile', command: () => this.lastAction.set('Selected: Settings > Profile') },
        { label: 'Security', command: () => this.lastAction.set('Selected: Settings > Security') },
      ],
    },
    {
      label: 'Reports',
      items: [
        { label: 'Sales', command: () => this.lastAction.set('Selected: Reports > Sales') },
        { label: 'Traffic', command: () => this.lastAction.set('Selected: Reports > Traffic') },
      ],
    },
  ];

  protected onSelect(item: MenuItem): void {
    this.lastAction.set(`Selected: ${item.label}`);
  }
}
