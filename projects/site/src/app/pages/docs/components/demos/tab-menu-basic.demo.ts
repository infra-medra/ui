import { Component, signal } from '@angular/core';
import { TabMenuComponent, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-tab-menu-basic-demo',
  imports: [TabMenuComponent],
  templateUrl: './tab-menu-basic.demo.html',
})
export class TabMenuBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: MenuItem[] = [
    { label: 'Overview', command: () => this.lastAction.set('Navigated to: Overview') },
    { label: 'Analytics', command: () => this.lastAction.set('Navigated to: Analytics') },
    { label: 'Settings', command: () => this.lastAction.set('Navigated to: Settings') },
  ];
}
