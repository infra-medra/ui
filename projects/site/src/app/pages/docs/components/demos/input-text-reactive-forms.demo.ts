import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-text-reactive-forms-demo',
  imports: [ReactiveFormsModule, InputTextDirective],
  templateUrl: './input-text-reactive-forms.demo.html',
})
export class InputTextReactiveFormsDemo {
  protected readonly usernameControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}
