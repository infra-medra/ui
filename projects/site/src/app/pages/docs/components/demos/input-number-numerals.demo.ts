import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-numerals-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-numerals.demo.html',
})
export class InputNumberNumeralsDemo {
  protected integer: number | null = 42723;
  protected grouping: number | null = 58151;
  protected minMaxFraction: number | null = 2351.35;
  protected bounded: number | null = 50;
}
