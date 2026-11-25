import { Component } from '@angular/core';
import { ButtonDirective, IconComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-button-template-demo',
  imports: [ButtonDirective, IconComponent],
  templateUrl: './button-template.demo.html',
})
export class ButtonTemplateDemo {}
