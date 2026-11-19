import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListboxComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-listbox-reactive-forms-demo',
  imports: [ReactiveFormsModule, ListboxComponent],
  templateUrl: './listbox-reactive-forms.demo.html',
})
export class ListboxReactiveFormsDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected readonly selectedCities = new FormControl<string[]>([], { nonNullable: true, validators: Validators.required });
}
