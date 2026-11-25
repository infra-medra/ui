import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-textarea-reactive-forms-demo',
  imports: [ReactiveFormsModule, TextareaDirective],
  templateUrl: './textarea-reactive-forms.demo.html',
})
export class TextareaReactiveFormsDemo {
  protected readonly summaryControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}
