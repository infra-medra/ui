import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-clear-icon-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-clear-icon.demo.html',
})
export class InputNumberClearIconDemo {
  protected value: number | null = 42;
}
