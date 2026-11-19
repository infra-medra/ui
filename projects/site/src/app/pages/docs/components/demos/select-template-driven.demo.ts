import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@medra/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-template-driven-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-template-driven.demo.html',
})
export class SelectTemplateDrivenDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected city: string | null = null;
}
