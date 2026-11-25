import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-textarea-filled-demo',
  imports: [FormsModule, TextareaDirective],
  templateUrl: './textarea-filled.demo.html',
})
export class TextareaFilledDemo {
  protected value = '';
}
