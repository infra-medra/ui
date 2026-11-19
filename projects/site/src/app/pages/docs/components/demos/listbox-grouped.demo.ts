import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-listbox-grouped-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-grouped.demo.html',
})
export class ListboxGroupedDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp', group: 'Brazil' },
    { label: 'Rio de Janeiro', value: 'rj', group: 'Brazil' },
    { label: 'Lisbon', value: 'lis', group: 'Portugal' },
    { label: 'Porto', value: 'porto', group: 'Portugal' },
    { label: 'Tokyo', value: 'tokyo', group: 'Japan' },
  ];

  protected selectedCities: string[] = [];
}
