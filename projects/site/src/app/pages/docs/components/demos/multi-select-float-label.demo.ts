import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, FloatLabelComponent, FloatLabelTextDirective } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-float-label-demo',
  imports: [FormsModule, MultiSelectComponent, FloatLabelComponent, FloatLabelTextDirective],
  templateUrl: './multi-select-float-label.demo.html',
})
export class MultiSelectFloatLabelDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
}
