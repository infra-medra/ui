import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-textarea-basic-demo',
  imports: [FormsModule, TextareaDirective],
  templateUrl: './textarea-basic.demo.html',
})
export class TextareaBasicDemo {
  protected feedback = '';
}
