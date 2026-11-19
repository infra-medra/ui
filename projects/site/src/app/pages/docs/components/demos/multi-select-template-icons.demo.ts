import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-multi-select-template-icons-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-template-icons.demo.html',
})
export class MultiSelectTemplateIconsDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected selectedCities: string[] = [];
}
