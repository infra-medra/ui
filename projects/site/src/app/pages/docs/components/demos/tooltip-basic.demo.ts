import { Component } from '@angular/core';
import { ButtonDirective, TooltipDirective } from '@medra/ui';

@Component({
  selector: 'app-tooltip-basic-demo',
  imports: [ButtonDirective, TooltipDirective],
  templateUrl: './tooltip-basic.demo.html',
})
export class TooltipBasicDemo {}
