import { Component } from '@angular/core';
import { ButtonDirective, PopoverComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-popover-customized-demo',
  imports: [ButtonDirective, PopoverComponent],
  templateUrl: './popover-customized.demo.html',
})
export class PopoverCustomizedDemo {}
