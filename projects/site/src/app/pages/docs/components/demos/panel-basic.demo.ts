import { Component, signal } from '@angular/core';
import { PanelComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-panel-basic-demo',
  imports: [PanelComponent],
  templateUrl: './panel-basic.demo.html',
})
export class PanelBasicDemo {
  protected readonly collapsed = signal(false);
}
