import { Component, signal } from '@angular/core';
import { AccordionComponent, AccordionTabComponent } from '@medra/ui';

@Component({
  selector: 'app-accordion-multiple-demo',
  imports: [AccordionComponent, AccordionTabComponent],
  templateUrl: './accordion-multiple.demo.html',
})
export class AccordionMultipleDemo {
  protected readonly activeIndexes = signal<readonly number[]>([0, 1]);
}
