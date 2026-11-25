import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-button-invalid-demo',
  imports: [FormsModule, SelectButtonComponent],
  templateUrl: './select-button-invalid.demo.html',
})
export class SelectButtonInvalidDemo {
  protected readonly options: SelectOption<'yes' | 'no'>[] = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];
  protected selected: 'yes' | 'no' | null = null;
}
