import { Component, signal } from '@angular/core';
import { MenuComponent, type MenuItemGroup } from '@medra/ui';

@Component({
  selector: 'app-menu-inline-groups-demo',
  imports: [MenuComponent],
  templateUrl: './menu-inline-groups.demo.html',
})
export class MenuInlineGroupsDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly groups: MenuItemGroup[] = [
    {
      label: 'File',
      items: [
        { label: 'New', icon: 'document-plus', command: () => this.lastAction.set('Selected: New') },
        { label: 'Rename', icon: 'pencil', command: () => this.lastAction.set('Selected: Rename') },
      ],
    },
    {
      label: 'Danger zone',
      items: [{ label: 'Delete', icon: 'trash', command: () => this.lastAction.set('Selected: Delete') }],
    },
  ];
}
