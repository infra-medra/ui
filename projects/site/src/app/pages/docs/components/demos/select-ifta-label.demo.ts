import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, IftaLabelComponent, IftaLabelTextDirective } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-ifta-label-demo',
  imports: [FormsModule, SelectComponent, IftaLabelComponent, IftaLabelTextDirective],
  templateUrl: './select-ifta-label.demo.html',
})
export class SelectIftaLabelDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected city: string | null = null;
}
