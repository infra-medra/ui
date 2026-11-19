import { Component, signal } from '@angular/core';
import { ButtonDirective, MenuComponent, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-menu-basic-demo',
  imports: [ButtonDirective, MenuComponent],
  templateUrl: './menu-basic.demo.html',
})
export class MenuBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: MenuItem[] = [
    { label: 'New file', icon: 'document-plus', command: () => this.lastAction.set('Selected: New file') },
    { label: 'Rename', icon: 'pencil', command: () => this.lastAction.set('Selected: Rename') },
    { separator: true },
    { label: 'Delete', icon: 'trash', command: () => this.lastAction.set('Selected: Delete') },
  ];
}
