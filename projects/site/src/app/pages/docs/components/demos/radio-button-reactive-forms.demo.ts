import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioButtonComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-radio-button-reactive-forms-demo',
  imports: [ReactiveFormsModule, RadioButtonComponent],
  templateUrl: './radio-button-reactive-forms.demo.html',
})
export class RadioButtonReactiveFormsDemo {
  protected readonly planControl = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });
}
