import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-checkbox-reactive-forms-demo',
  imports: [ReactiveFormsModule, CheckboxComponent],
  templateUrl: './checkbox-reactive-forms.demo.html',
})
export class CheckboxReactiveFormsDemo {
  protected readonly acceptedControl = new FormControl(false, {
    nonNullable: true,
    validators: [Validators.requiredTrue],
  });
}
