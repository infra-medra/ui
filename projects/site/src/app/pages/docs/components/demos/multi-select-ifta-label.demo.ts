import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, IftaLabelComponent, IftaLabelTextDirective } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-ifta-label-demo',
  imports: [FormsModule, MultiSelectComponent, IftaLabelComponent, IftaLabelTextDirective],
  templateUrl: './multi-select-ifta-label.demo.html',
})
export class MultiSelectIftaLabelDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
}
