import { Component, signal } from '@angular/core';
import { VirtualScrollerComponent } from '@medra/ui';

interface LogEntry {
  readonly id: number;
  readonly message: string;
}

const PAGE_SIZE = 50;
const TOTAL = 500;

function buildPage(first: number, count: number): LogEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const id = first + i;
    return { id, message: `job-${id.toString().padStart(4, '0')} finished in ${((id % 47) + 3)}ms` };
  });
}

@Component({
  selector: 'app-virtual-scroller-lazy-load-demo',
  imports: [VirtualScrollerComponent],
  templateUrl: './virtual-scroller-lazy-load.demo.html',
})
export class VirtualScrollerLazyLoadDemo {
  protected readonly entries = signal<LogEntry[]>(buildPage(0, PAGE_SIZE));
  protected readonly loading = signal(false);

  protected onLazyLoad(range: { first: number; last: number }): void {
    if (this.loading() || this.entries().length >= TOTAL) {
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      const remaining = TOTAL - this.entries().length;
      const count = Math.min(range.last - range.first + 1, remaining);
      this.entries.update((current) => [...current, ...buildPage(current.length, count)]);
      this.loading.set(false);
    }, 500);
  }
}
