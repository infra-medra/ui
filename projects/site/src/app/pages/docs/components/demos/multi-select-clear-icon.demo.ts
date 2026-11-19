import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-clear-icon-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-clear-icon.demo.html',
})
export class MultiSelectClearIconDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
}
