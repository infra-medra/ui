import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-template-option-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-template-option.demo.html',
})
export class SelectTemplateOptionDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected city: string | null = null;
}
