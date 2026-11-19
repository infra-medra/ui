import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, FloatLabelComponent, FloatLabelTextDirective } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-float-label-demo',
  imports: [FormsModule, SelectComponent, FloatLabelComponent, FloatLabelTextDirective],
  templateUrl: './select-float-label.demo.html',
})
export class SelectFloatLabelDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected city: string | null = null;
}
