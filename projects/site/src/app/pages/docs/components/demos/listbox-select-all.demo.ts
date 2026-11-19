import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-listbox-select-all-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-select-all.demo.html',
})
export class ListboxSelectAllDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Rio de Janeiro', value: 'rj' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Porto', value: 'porto' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected selectedCities: string[] = [];
  protected lastToggle = 'none';
}
