import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelComponent, FloatLabelTextDirective, InputTextDirective } from '@medra/ui';

@Component({
  selector: 'app-float-label-variants-demo',
  imports: [FormsModule, FloatLabelComponent, FloatLabelTextDirective, InputTextDirective],
  templateUrl: './float-label-variants.demo.html',
})
export class FloatLabelVariantsDemo {
  protected onValue = '';
  protected overValue = '';
  protected inValue = '';
}
