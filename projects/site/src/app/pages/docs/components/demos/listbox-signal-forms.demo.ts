import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { ListboxComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-listbox-signal-forms-demo',
  imports: [FormField, ListboxComponent],
  templateUrl: './listbox-signal-forms.demo.html',
})
export class ListboxSignalFormsDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  private readonly model = signal<{ cities: string[] }>({ cities: [] });
  protected readonly cityForm = form(this.model);
  protected readonly current = () => this.model().cities;
}
