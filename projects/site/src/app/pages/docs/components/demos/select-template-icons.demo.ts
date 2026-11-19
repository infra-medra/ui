import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-select-template-icons-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-template-icons.demo.html',
})
export class SelectTemplateIconsDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected city: string | null = null;
}
