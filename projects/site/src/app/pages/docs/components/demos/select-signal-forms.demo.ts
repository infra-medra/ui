import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { SelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-signal-forms-demo',
  imports: [FormField, SelectComponent],
  templateUrl: './select-signal-forms.demo.html',
})
export class SelectSignalFormsDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  private readonly model = signal<{ city: string | null }>({ city: null });
  protected readonly cityForm = form(this.model);
  protected readonly current = () => this.model().city;
}
