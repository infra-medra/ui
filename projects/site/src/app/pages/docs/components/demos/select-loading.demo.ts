import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-loading-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-loading.demo.html',
})
export class SelectLoadingDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected city: string | null = null;
}
