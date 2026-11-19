import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-multi-select-template-value-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-template-value.demo.html',
})
export class MultiSelectTemplateValueDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected selectedCities: string[] = [];
}
