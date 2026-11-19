import { Component, viewChild } from '@angular/core';
import { ButtonDirective, ScrollPanelComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-scroll-panel-scroll-to-demo',
  imports: [ScrollPanelComponent, ButtonDirective],
  templateUrl: './scroll-panel-scroll-to.demo.html',
})
export class ScrollPanelScrollToDemo {
  protected readonly entries = Array.from({ length: 30 }, (_, i) => `Line ${i + 1}`);
  protected readonly panel = viewChild.required(ScrollPanelComponent);

  protected scrollToTop(): void {
    this.panel().scrollTop(0);
  }

  protected scrollToBottom(): void {
    this.panel().scrollTop(Number.MAX_SAFE_INTEGER);
  }
}
