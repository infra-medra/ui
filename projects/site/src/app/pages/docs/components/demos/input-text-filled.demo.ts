import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-text-filled-demo',
  imports: [FormsModule, InputTextDirective],
  templateUrl: './input-text-filled.demo.html',
})
export class InputTextFilledDemo {
  protected value = '';
}
