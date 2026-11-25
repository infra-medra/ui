import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-disabled-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-disabled.demo.html',
})
export class InputNumberDisabledDemo {
  protected value: number | null = 50;
}
