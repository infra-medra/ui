import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-invalid-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-invalid.demo.html',
})
export class SelectInvalidDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected city: string | null = null;
}
