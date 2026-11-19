import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-template-group-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-template-group.demo.html',
})
export class SelectTemplateGroupDemo {
  protected readonly cities: SelectOption<string>[] = [
    { label: 'São Paulo', value: 'sp', group: 'Brazil' },
    { label: 'Rio de Janeiro', value: 'rj', group: 'Brazil' },
    { label: 'Lisbon', value: 'lis', group: 'Portugal' },
    { label: 'Porto', value: 'porto', group: 'Portugal' },
  ];

  protected city: string | null = null;
}
