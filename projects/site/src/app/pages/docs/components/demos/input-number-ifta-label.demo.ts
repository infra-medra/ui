import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelComponent, IftaLabelTextDirective, InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-ifta-label-demo',
  imports: [FormsModule, InputNumberComponent, IftaLabelComponent, IftaLabelTextDirective],
  templateUrl: './input-number-ifta-label.demo.html',
})
export class InputNumberIftaLabelDemo {
  protected value: number | null = null;
}
