import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-button-fluid-demo',
  imports: [FormsModule, SelectButtonComponent],
  templateUrl: './select-button-fluid.demo.html',
})
export class SelectButtonFluidDemo {
  protected readonly options: SelectOption<'left' | 'center' | 'right'>[] = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ];
  protected fluidValue: 'left' | 'center' | 'right' | null = 'left';
  protected defaultValue: 'left' | 'center' | 'right' | null = 'left';
}
