import { Component, signal, viewChild } from '@angular/core';
import { ButtonDirective, VirtualScrollerComponent } from '@medra/ui';

interface LogEntry {
  readonly id: number;
  readonly message: string;
}

@Component({
  selector: 'app-virtual-scroller-scroll-to-index-demo',
  imports: [VirtualScrollerComponent, ButtonDirective],
  templateUrl: './virtual-scroller-scroll-to-index.demo.html',
})
export class VirtualScrollerScrollToIndexDemo {
  protected readonly entries: LogEntry[] = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    message: `job-${i.toString().padStart(4, '0')} finished in ${((i % 47) + 3)}ms`,
  }));

  protected readonly scroller = viewChild.required(VirtualScrollerComponent);
  protected readonly visibleRange = signal('Not scrolled yet.');

  protected jumpTo(index: number): void {
    this.scroller().scrollToIndex(index, 'smooth');
  }

  protected onScrollIndexChange(range: { first: number; last: number }): void {
    this.visibleRange.set(`Rendering rows ${range.first}–${range.last}`);
  }
}
