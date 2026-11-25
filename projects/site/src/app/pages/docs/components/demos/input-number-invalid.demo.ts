import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-invalid-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-invalid.demo.html',
})
export class InputNumberInvalidDemo {
  protected value: number | null = null;
}
