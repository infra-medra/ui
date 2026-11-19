import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-sizes-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-sizes.demo.html',
})
export class SelectSizesDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected city: string | null = null;
}
