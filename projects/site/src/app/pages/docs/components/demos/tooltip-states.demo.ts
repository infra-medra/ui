import { Component } from '@angular/core';
import { ButtonDirective, TooltipDirective } from '@medra/ui';

@Component({
  selector: 'app-tooltip-states-demo',
  imports: [ButtonDirective, TooltipDirective],
  templateUrl: './tooltip-states.demo.html',
})
export class TooltipStatesDemo {}
