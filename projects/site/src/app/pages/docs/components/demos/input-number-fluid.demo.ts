import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-fluid-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-fluid.demo.html',
})
export class InputNumberFluidDemo {
  protected value: number | null = 100;
}
