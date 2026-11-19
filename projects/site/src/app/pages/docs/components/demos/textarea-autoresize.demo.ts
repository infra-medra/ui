import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaDirective } from '@medra/ui';

@Component({
  selector: 'app-textarea-autoresize-demo',
  imports: [FormsModule, TextareaDirective],
  templateUrl: './textarea-autoresize.demo.html',
})
export class TextareaAutoresizeDemo {
  protected notes = 'Start typing — this field grows with you.\nAdd another line and watch it expand.';
}
