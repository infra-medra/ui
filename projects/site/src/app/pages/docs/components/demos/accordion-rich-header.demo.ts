import { Component } from '@angular/core';
import { AccordionComponent, AccordionTabComponent, AccordionTabHeaderDirective, IconComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-accordion-rich-header-demo',
  imports: [AccordionComponent, AccordionTabComponent, AccordionTabHeaderDirective, IconComponent],
  templateUrl: './accordion-rich-header.demo.html',
})
export class AccordionRichHeaderDemo {}
