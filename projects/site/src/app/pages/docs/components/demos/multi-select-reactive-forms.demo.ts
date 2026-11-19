import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MultiSelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-reactive-forms-demo',
  imports: [ReactiveFormsModule, MultiSelectComponent],
  templateUrl: './multi-select-reactive-forms.demo.html',
})
export class MultiSelectReactiveFormsDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected readonly selectedCities = new FormControl<string[]>([], { nonNullable: true, validators: Validators.required });
}
