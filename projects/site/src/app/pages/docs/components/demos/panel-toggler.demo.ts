import { Component, signal } from '@angular/core';
import { ButtonDirective, PanelComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-panel-toggler-demo',
  imports: [PanelComponent, ButtonDirective],
  templateUrl: './panel-toggler.demo.html',
})
export class PanelTogglerDemo {
  protected readonly collapsed = signal(false);
  protected readonly headerless = signal(false);
}
