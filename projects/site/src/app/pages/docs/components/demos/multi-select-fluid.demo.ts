import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-fluid-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-fluid.demo.html',
})
export class MultiSelectFluidDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
}
