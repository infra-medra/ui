import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-template-value-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-template-value.demo.html',
})
export class SelectTemplateValueDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp' },
    { label: 'Lisbon', value: 'lis' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  protected city: string | null = null;
}
