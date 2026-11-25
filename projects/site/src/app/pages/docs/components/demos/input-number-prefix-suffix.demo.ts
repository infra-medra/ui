import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-prefix-suffix-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-prefix-suffix.demo.html',
})
export class InputNumberPrefixSuffixDemo {
  protected miles: number | null = 20;
  protected percent: number | null = 50;
  protected expiry: number | null = 10;
  protected temperature: number | null = 24;
}
