import { Component, signal } from '@angular/core';
import { AccordionComponent, AccordionTabComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-accordion-events-demo',
  imports: [AccordionComponent, AccordionTabComponent],
  templateUrl: './accordion-events.demo.html',
})
export class AccordionEventsDemo {
  protected readonly activeIndex = signal<number | null>(null);
  protected readonly log = signal<string[]>([]);

  protected onOpened(index: number): void {
    this.log.update((lines) => [...lines, `opened: panel ${index}`]);
  }

  protected onClosed(index: number): void {
    this.log.update((lines) => [...lines, `closed: panel ${index}`]);
  }
}
