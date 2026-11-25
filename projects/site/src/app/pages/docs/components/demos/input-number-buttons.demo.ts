import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-buttons-demo',
  imports: [FormsModule, InputNumberComponent],
  templateUrl: './input-number-buttons.demo.html',
})
export class InputNumberButtonsDemo {
  protected stacked: number | null = 20;
  protected horizontal: number | null = 10.5;
  protected vertical: number | null = 25;
}
