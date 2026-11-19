import { Component, signal } from '@angular/core';
import { ContextMenuDirective, type TieredMenuItem } from '@medra/ui';

@Component({
  selector: 'app-context-menu-nested-demo',
  imports: [ContextMenuDirective],
  templateUrl: './context-menu-nested.demo.html',
})
export class ContextMenuNestedDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: TieredMenuItem[] = [
    {
      label: 'New',
      items: [
        { label: 'File', command: () => this.select('New > File') },
        { label: 'Folder', command: () => this.select('New > Folder') },
      ],
    },
    { label: 'Rename', command: () => this.select('Rename') },
    { separator: true },
    { label: 'Delete', command: () => this.select('Delete') },
  ];

  private select(label: string): void {
    this.lastAction.set(`Selected: ${label}`);
  }
}
