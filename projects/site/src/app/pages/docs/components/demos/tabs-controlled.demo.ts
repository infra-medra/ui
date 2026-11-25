import { Component, signal } from '@angular/core';
import { ButtonDirective, TabComponent, TabsComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-tabs-controlled-demo',
  imports: [ButtonDirective, TabComponent, TabsComponent],
  templateUrl: './tabs-controlled.demo.html',
})
export class TabsControlledDemo {
  protected readonly activeIndex = signal(0);
}
