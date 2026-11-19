import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelComponent, IftaLabelTextDirective, InputTextDirective } from '@medra/ui';

@Component({
  selector: 'app-ifta-label-basic-demo',
  imports: [FormsModule, IftaLabelComponent, IftaLabelTextDirective, InputTextDirective],
  templateUrl: './ifta-label-basic.demo.html',
})
export class IftaLabelBasicDemo {
  protected username = '';
}
