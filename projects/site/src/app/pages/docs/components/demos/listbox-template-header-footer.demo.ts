import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-listbox-template-header-footer-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-template-header-footer.demo.html',
})
export class ListboxTemplateHeaderFooterDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected selectedCities: string[] = [];
}
