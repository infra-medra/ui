import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-button-multiple-demo',
  imports: [FormsModule, SelectButtonComponent],
  templateUrl: './select-button-multiple.demo.html',
})
export class SelectButtonMultipleDemo {
  protected readonly formatOptions: SelectOption<'bold' | 'italic' | 'underline'>[] = [
    { label: 'Bold', value: 'bold' },
    { label: 'Italic', value: 'italic' },
    { label: 'Underline', value: 'underline' },
  ];
  protected formats: ('bold' | 'italic' | 'underline')[] = ['bold'];
}
