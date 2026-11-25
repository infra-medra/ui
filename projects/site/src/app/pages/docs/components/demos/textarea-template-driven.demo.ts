import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextareaDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-textarea-template-driven-demo',
  imports: [FormsModule, TextareaDirective],
  templateUrl: './textarea-template-driven.demo.html',
})
export class TextareaTemplateDrivenDemo {
  protected summary = '';
}
