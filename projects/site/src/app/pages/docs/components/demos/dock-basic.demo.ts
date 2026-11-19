import { Component, signal } from '@angular/core';
import { DockComponent, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-dock-basic-demo',
  imports: [DockComponent],
  templateUrl: './dock-basic.demo.html',
})
export class DockBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: MenuItem[] = [
    { label: 'Mail', icon: 'envelope', command: () => this.lastAction.set('Opened: Mail') },
    { label: 'Calendar', icon: 'calendar', command: () => this.lastAction.set('Opened: Calendar') },
    { label: 'Photos', icon: 'photo', command: () => this.lastAction.set('Opened: Photos') },
    { label: 'Settings', icon: 'cog-6-tooth', command: () => this.lastAction.set('Opened: Settings') },
  ];
}
