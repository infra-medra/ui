import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-clear-icon-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-clear-icon.demo.html',
})
export class SelectClearIconDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected city: string | null = null;
}
