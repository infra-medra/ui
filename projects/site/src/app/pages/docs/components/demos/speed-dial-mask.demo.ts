import { Component } from '@angular/core';
import { SpeedDialComponent, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-speed-dial-mask-demo',
  imports: [SpeedDialComponent],
  templateUrl: './speed-dial-mask.demo.html',
})
export class SpeedDialMaskDemo {
  protected readonly items: MenuItem[] = [
    { label: 'Share', icon: 'arrow-up-tray' },
    { label: 'Copy link', icon: 'document-duplicate' },
    { label: 'Delete', icon: 'trash' },
  ];
}
