import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-invalid-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-invalid.demo.html',
})
export class MultiSelectInvalidDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
}
