import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-reactive-forms-demo',
  imports: [ReactiveFormsModule, SelectComponent],
  templateUrl: './select-reactive-forms.demo.html',
})
export class SelectReactiveFormsDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected readonly city = new FormControl<string | null>(null, Validators.required);
}
