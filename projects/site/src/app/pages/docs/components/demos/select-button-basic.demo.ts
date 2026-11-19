import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-button-basic-demo',
  imports: [FormsModule, SelectButtonComponent],
  templateUrl: './select-button-basic.demo.html',
})
export class SelectButtonBasicDemo {
  protected readonly viewOptions: SelectOption<'list' | 'grid' | 'table'>[] = [
    { label: 'List', value: 'list' },
    { label: 'Grid', value: 'grid' },
    { label: 'Table', value: 'table' },
  ];
  protected view: 'list' | 'grid' | 'table' | null = 'list';
}
