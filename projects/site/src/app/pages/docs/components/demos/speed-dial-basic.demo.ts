import { Component, signal } from '@angular/core';
import { SpeedDialComponent, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-speed-dial-basic-demo',
  imports: [SpeedDialComponent],
  templateUrl: './speed-dial-basic.demo.html',
})
export class SpeedDialBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: MenuItem[] = [
    { label: 'Share', icon: 'arrow-up-tray' },
    { label: 'Copy link', icon: 'document-duplicate' },
    { label: 'Delete', icon: 'trash' },
  ];

  protected onSelect(item: MenuItem): void {
    this.lastAction.set(`Selected: ${item.label}`);
  }
}
