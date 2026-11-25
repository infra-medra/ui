import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-button-reactive-forms-demo',
  imports: [ReactiveFormsModule, SelectButtonComponent],
  templateUrl: './select-button-reactive-forms.demo.html',
})
export class SelectButtonReactiveFormsDemo {
  protected readonly planOptions: SelectOption<'free' | 'pro' | 'enterprise'>[] = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
  ];
  protected readonly planControl = new FormControl<'free' | 'pro' | 'enterprise' | null>(null, {
    validators: [Validators.required],
  });
}
