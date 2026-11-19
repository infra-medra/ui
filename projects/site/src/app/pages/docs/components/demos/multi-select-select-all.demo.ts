import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-select-all-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-select-all.demo.html',
})
export class MultiSelectSelectAllDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
  protected lastToggle = 'none';
}
