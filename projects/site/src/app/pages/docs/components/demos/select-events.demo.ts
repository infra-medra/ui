import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@medra.dev/ui';
import { SELECT_DEMO_CITIES } from './select-demo-data';

@Component({
  selector: 'app-select-events-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-events.demo.html',
})
export class SelectEventsDemo {
  protected readonly cities = SELECT_DEMO_CITIES;
  protected city: string | null = null;
  protected lastEvent = 'none';

  protected log(message: string): void {
    this.lastEvent = message;
  }
}
