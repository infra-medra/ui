import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelComponent, FloatLabelTextDirective, TextareaDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-textarea-float-label-demo',
  imports: [FormsModule, TextareaDirective, FloatLabelComponent, FloatLabelTextDirective],
  templateUrl: './textarea-float-label.demo.html',
})
export class TextareaFloatLabelDemo {
  protected bio = '';
}
