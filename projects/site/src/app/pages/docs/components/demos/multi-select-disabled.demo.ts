import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-disabled-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-disabled.demo.html',
})
export class MultiSelectDisabledDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
}
