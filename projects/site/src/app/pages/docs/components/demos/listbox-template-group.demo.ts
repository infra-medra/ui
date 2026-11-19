import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-listbox-template-group-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-template-group.demo.html',
})
export class ListboxTemplateGroupDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp', group: 'Brazil' },
    { label: 'Rio de Janeiro', value: 'rj', group: 'Brazil' },
    { label: 'Lisbon', value: 'lis', group: 'Portugal' },
    { label: 'Porto', value: 'porto', group: 'Portugal' },
  ];

  protected selectedCities: string[] = [];
}
