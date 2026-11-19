import { Component } from '@angular/core';
import { ScrollPanelComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-scroll-panel-basic-demo',
  imports: [ScrollPanelComponent],
  templateUrl: './scroll-panel-basic.demo.html',
})
export class ScrollPanelBasicDemo {
  protected readonly entries = Array.from({ length: 12 }, (_, i) => `Changelog entry #${i + 1}`);
}
