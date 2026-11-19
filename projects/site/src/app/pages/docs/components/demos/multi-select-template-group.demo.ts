import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-multi-select-template-group-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-template-group.demo.html',
})
export class MultiSelectTemplateGroupDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp', group: 'Brazil' },
    { label: 'Rio de Janeiro', value: 'rj', group: 'Brazil' },
    { label: 'Lisbon', value: 'lis', group: 'Portugal' },
    { label: 'Porto', value: 'porto', group: 'Portugal' },
  ];

  protected selectedCities: string[] = [];
}
