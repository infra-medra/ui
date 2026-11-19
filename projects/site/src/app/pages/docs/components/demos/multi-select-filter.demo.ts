import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-filter-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-filter.demo.html',
})
export class MultiSelectFilterDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
  protected lastFilter = '';
}
