import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-sizes-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-sizes.demo.html',
})
export class InputNumberSizesDemo {
  protected smallValue: number | null = 10;
  protected defaultValue: number | null = 20;
  protected largeValue: number | null = 30;
}
