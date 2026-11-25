import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TextareaDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-textarea-signal-forms-demo',
  imports: [FormField, TextareaDirective],
  templateUrl: './textarea-signal-forms.demo.html',
})
export class TextareaSignalFormsDemo {
  private readonly model = signal({ summary: '' });
  protected readonly notesForm = form(this.model);
  protected readonly current = () => this.model().summary;
}
