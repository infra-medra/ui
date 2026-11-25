import { Component } from '@angular/core';
import { ButtonDirective, IconComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-button-badge-demo',
  imports: [ButtonDirective, IconComponent],
  templateUrl: './button-badge.demo.html',
})
export class ButtonBadgeDemo {}
