import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MultiSelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-signal-forms-demo',
  imports: [FormField, MultiSelectComponent],
  templateUrl: './multi-select-signal-forms.demo.html',
})
export class MultiSelectSignalFormsDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  private readonly model = signal<{ cities: string[] }>({ cities: [] });
  protected readonly cityForm = form(this.model);
  protected readonly current = () => this.model().cities;
}
