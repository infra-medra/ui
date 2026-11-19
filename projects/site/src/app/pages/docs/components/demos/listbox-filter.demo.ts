import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-listbox-filter-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-filter.demo.html',
})
export class ListboxFilterDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
    { label: 'Porto', value: 'porto' },
  ];

  protected selectedCities: string[] = [];
  protected lastFilter = '';
}
