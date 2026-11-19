import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-select-template-header-footer-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-template-header-footer.demo.html',
})
export class SelectTemplateHeaderFooterDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected city: string | null = null;
}
