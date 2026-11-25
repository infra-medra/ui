import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-select-button-sizes-demo',
  imports: [FormsModule, SelectButtonComponent],
  templateUrl: './select-button-sizes.demo.html',
})
export class SelectButtonSizesDemo {
  protected readonly periodOptions: SelectOption<'daily' | 'weekly' | 'monthly'>[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];
  protected smallValue: 'daily' | 'weekly' | 'monthly' | null = 'daily';
  protected defaultValue: 'daily' | 'weekly' | 'monthly' | null = 'weekly';
  protected largeValue: 'daily' | 'weekly' | 'monthly' | null = 'monthly';
}
