import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelComponent, FloatLabelTextDirective, InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-float-label-demo',
  imports: [FormsModule, InputNumberComponent, FloatLabelComponent, FloatLabelTextDirective],
  templateUrl: './input-number-float-label.demo.html',
})
export class InputNumberFloatLabelDemo {
  protected value: number | null = null;
}
