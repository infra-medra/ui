import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-listbox-checkmark-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-checkmark.demo.html',
})
export class ListboxCheckmarkDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Rio de Janeiro', value: 'rj' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Porto', value: 'porto' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected selectedCities: string[] = [];
}
