import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelComponent, IftaLabelTextDirective, TextareaDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-textarea-ifta-label-demo',
  imports: [FormsModule, TextareaDirective, IftaLabelComponent, IftaLabelTextDirective],
  templateUrl: './textarea-ifta-label.demo.html',
})
export class TextareaIftaLabelDemo {
  protected notes = '';
}
