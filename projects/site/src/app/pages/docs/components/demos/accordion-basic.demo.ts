import { Component, signal } from '@angular/core';
import { AccordionComponent, AccordionTabComponent } from '@medra/ui';

@Component({
  selector: 'app-accordion-basic-demo',
  imports: [AccordionComponent, AccordionTabComponent],
  templateUrl: './accordion-basic.demo.html',
})
export class AccordionBasicDemo {
  protected readonly activeIndex = signal<number | null>(0);
}
