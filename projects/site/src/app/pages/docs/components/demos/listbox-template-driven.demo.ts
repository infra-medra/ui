import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-listbox-template-driven-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-template-driven.demo.html',
})
export class ListboxTemplateDrivenDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
}
