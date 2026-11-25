import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelComponent, IftaLabelTextDirective, InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-text-ifta-label-demo',
  imports: [FormsModule, InputTextDirective, IftaLabelComponent, IftaLabelTextDirective],
  templateUrl: './input-text-ifta-label.demo.html',
})
export class InputTextIftaLabelDemo {
  protected username = '';
}
