import { Component } from '@angular/core';
import { SpeedDialComponent, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-speed-dial-direction-demo',
  imports: [SpeedDialComponent],
  templateUrl: './speed-dial-direction.demo.html',
})
export class SpeedDialDirectionDemo {
  protected readonly items: MenuItem[] = [{ label: 'One', icon: 'check' }, { label: 'Two', icon: 'check' }];
}
