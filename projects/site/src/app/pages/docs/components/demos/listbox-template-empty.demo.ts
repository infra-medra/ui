import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-listbox-template-empty-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-template-empty.demo.html',
})
export class ListboxTemplateEmptyDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected selectedCities: string[] = [];
}
