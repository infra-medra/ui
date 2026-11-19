import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-multi-select-events-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-events.demo.html',
})
export class MultiSelectEventsDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected selectedCities: string[] = [];
  protected lastEvent = 'none';

  protected log(message: string): void {
    this.lastEvent = message;
  }
}
