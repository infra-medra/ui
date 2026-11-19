import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-filled-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-filled.demo.html',
})
export class SelectFilledDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected city: string | null = null;
}
