import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-vertical-clear-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-vertical-clear.demo.html',
})
export class InputNumberVerticalClearDemo {
  protected quantity: number | null = 3;
}
