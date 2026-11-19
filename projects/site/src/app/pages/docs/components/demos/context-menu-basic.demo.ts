import { Component, signal } from '@angular/core';
import { ContextMenuDirective, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-context-menu-basic-demo',
  imports: [ContextMenuDirective],
  templateUrl: './context-menu-basic.demo.html',
})
export class ContextMenuBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: MenuItem[] = [
    { label: 'Cut', command: () => this.lastAction.set('Selected: Cut') },
    { label: 'Copy', command: () => this.lastAction.set('Selected: Copy') },
    { label: 'Paste', command: () => this.lastAction.set('Selected: Paste') },
    { separator: true },
    { label: 'Delete', command: () => this.lastAction.set('Selected: Delete') },
  ];
}
