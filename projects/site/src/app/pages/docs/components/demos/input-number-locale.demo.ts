import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-locale-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-locale.demo.html',
})
export class InputNumberLocaleDemo {
  protected usValue: number | null = 151351.25;
  protected germanValue: number | null = 151351.25;
  protected brazilValue: number | null = 151351.25;
}
