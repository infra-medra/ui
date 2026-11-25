import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-reactive-forms-demo',
  imports: [ReactiveFormsModule, InputNumberComponent],
  templateUrl: './input-number-reactive-forms.demo.html',
})
export class InputNumberReactiveFormsDemo {
  protected readonly quantityControl = new FormControl<number | null>(null, Validators.required);
}
