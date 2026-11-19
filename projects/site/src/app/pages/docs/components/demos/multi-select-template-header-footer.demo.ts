import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-multi-select-template-header-footer-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-template-header-footer.demo.html',
})
export class MultiSelectTemplateHeaderFooterDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected selectedCities: string[] = [];
}
