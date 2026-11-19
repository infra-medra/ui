import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-listbox-events-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-events.demo.html',
})
export class ListboxEventsDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Rio de Janeiro', value: 'rj' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Porto', value: 'porto' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected selectedCities: string[] = [];
  protected lastEvent = 'none';

  protected log(message: string): void {
    this.lastEvent = message;
  }
}
