import { Component } from '@angular/core';
import { ButtonDirective, ButtonGroupComponent, IconComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-button-group-demo',
  imports: [ButtonDirective, ButtonGroupComponent, IconComponent],
  templateUrl: './button-group.demo.html',
})
export class ButtonGroupDemo {}
