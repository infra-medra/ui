import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-text-basic-demo',
  imports: [FormsModule, InputTextDirective],
  templateUrl: './input-text-basic.demo.html',
})
export class InputTextBasicDemo {
  protected teamName = '';
}
