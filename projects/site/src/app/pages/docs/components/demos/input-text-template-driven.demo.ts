import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-text-template-driven-demo',
  imports: [FormsModule, InputTextDirective],
  templateUrl: './input-text-template-driven.demo.html',
})
export class InputTextTemplateDrivenDemo {
  protected username = '';
}
