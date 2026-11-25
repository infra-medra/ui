import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelComponent, FloatLabelTextDirective, InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-text-float-label-demo',
  imports: [FormsModule, InputTextDirective, FloatLabelComponent, FloatLabelTextDirective],
  templateUrl: './input-text-float-label.demo.html',
})
export class InputTextFloatLabelDemo {
  protected username = '';
}
