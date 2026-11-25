import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-currency-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-currency.demo.html',
})
export class InputNumberCurrencyDemo {
  protected usd: number | null = 1500;
  protected eur: number | null = 2500;
  protected jpy: number | null = 10000;
}
