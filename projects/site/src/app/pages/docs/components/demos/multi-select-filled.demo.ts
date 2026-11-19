import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-filled-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-filled.demo.html',
})
export class MultiSelectFilledDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
}
