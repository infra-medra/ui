import { Component } from '@angular/core';
import { ButtonDirective, IconComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-button-icon-only-demo',
  imports: [ButtonDirective, IconComponent],
  templateUrl: './button-icon-only.demo.html',
})
export class ButtonIconOnlyDemo {}
