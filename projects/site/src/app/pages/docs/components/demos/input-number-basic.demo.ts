import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-basic-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-basic.demo.html',
})
export class InputNumberBasicDemo {
  protected price: number | null = 49.9;
}
