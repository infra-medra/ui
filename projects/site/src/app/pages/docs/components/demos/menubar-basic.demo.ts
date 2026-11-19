import { Component, signal } from '@angular/core';
import { MenubarComponent, type MenubarItem } from '@medra/ui';

@Component({
  selector: 'app-menubar-basic-demo',
  imports: [MenubarComponent],
  templateUrl: './menubar-basic.demo.html',
})
export class MenubarBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: MenubarItem[] = [
    {
      label: 'File',
      items: [
        { label: 'New', command: () => this.lastAction.set('Selected: File > New') },
        { label: 'Open', command: () => this.lastAction.set('Selected: File > Open') },
        { label: 'Save', command: () => this.lastAction.set('Selected: File > Save') },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Cut', command: () => this.lastAction.set('Selected: Edit > Cut') },
        { label: 'Copy', command: () => this.lastAction.set('Selected: Edit > Copy') },
        { label: 'Paste', command: () => this.lastAction.set('Selected: Edit > Paste') },
      ],
    },
    { label: 'Help', command: () => this.lastAction.set('Selected: Help') },
  ];
}
