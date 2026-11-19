import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelComponent, FloatLabelTextDirective, InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-float-label-basic-demo',
  imports: [FormsModule, FloatLabelComponent, FloatLabelTextDirective, InputTextDirective],
  templateUrl: './float-label-basic.demo.html',
})
export class FloatLabelBasicDemo {
  protected email = '';
}
