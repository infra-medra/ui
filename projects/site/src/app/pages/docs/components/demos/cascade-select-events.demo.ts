import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectComponent } from '@medra/ui';
import { CASCADE_SELECT_CATALOG } from './cascade-select-demo-data';

@Component({
  selector: 'app-cascade-select-events-demo',
  imports: [FormsModule, CascadeSelectComponent],
  templateUrl: './cascade-select-events.demo.html',
})
export class CascadeSelectEventsDemo {
  protected readonly catalog = CASCADE_SELECT_CATALOG;
  protected item: string | null = null;
  protected lastEvent = 'none';

  protected log(message: string): void {
    this.lastEvent = message;
  }
}
