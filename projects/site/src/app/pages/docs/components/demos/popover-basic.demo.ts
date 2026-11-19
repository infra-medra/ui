import { Component } from '@angular/core';
import { ButtonDirective, InputTextDirective, PopoverComponent } from '@medra/ui';

@Component({
  selector: 'app-popover-basic-demo',
  imports: [ButtonDirective, InputTextDirective, PopoverComponent],
  templateUrl: './popover-basic.demo.html',
})
export class PopoverBasicDemo {}
