import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-text-help-text-demo',
  imports: [FormsModule, InputTextDirective],
  templateUrl: './input-text-help-text.demo.html',
})
export class InputTextHelpTextDemo {
  protected username = '';
}
