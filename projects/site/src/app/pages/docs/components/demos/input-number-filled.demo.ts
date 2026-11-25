import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-filled-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-filled.demo.html',
})
export class InputNumberFilledDemo {
  protected value: number | null = null;
}
