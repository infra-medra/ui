import { Component, signal } from '@angular/core';
import { ContextMenuDirective, type TieredMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-context-menu-global-demo',
  imports: [ContextMenuDirective],
  templateUrl: './context-menu-global.demo.html',
})
export class ContextMenuGlobalDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: TieredMenuItem[] = [
    { label: 'Copy', command: () => this.select('Copy') },
    { label: 'Paste', command: () => this.select('Paste') },
    { separator: true },
    { label: 'Inspect', command: () => this.select('Inspect') },
  ];

  private select(label: string): void {
    this.lastAction.set(`Selected: ${label}`);
  }
}
