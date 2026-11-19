import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-select-button-allow-empty-demo',
  imports: [FormsModule, SelectButtonComponent],
  templateUrl: './select-button-allow-empty.demo.html',
})
export class SelectButtonAllowEmptyDemo {
  protected readonly alignOptions: SelectOption<'left' | 'center' | 'right'>[] = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ];
  protected align: 'left' | 'center' | 'right' | null = 'left';
}
