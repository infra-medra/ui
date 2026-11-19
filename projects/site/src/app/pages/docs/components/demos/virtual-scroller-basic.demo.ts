import { Component } from '@angular/core';
import { VirtualScrollerComponent } from '@medra/ui';

interface LogEntry {
  readonly id: number;
  readonly message: string;
}

const LEVELS = ['info', 'warn', 'error', 'debug'] as const;

@Component({
  selector: 'app-virtual-scroller-basic-demo',
  imports: [VirtualScrollerComponent],
  templateUrl: './virtual-scroller-basic.demo.html',
})
export class VirtualScrollerBasicDemo {
  /** 5,000 synthetic log lines — large enough that rendering every row at once would be wasteful. */
  protected readonly entries: LogEntry[] = Array.from({ length: 5000 }, (_, i) => ({
    id: i,
    message: `[${LEVELS[i % LEVELS.length]}] job-${i.toString().padStart(5, '0')} finished in ${((i % 47) + 3)}ms`,
  }));
}
