import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-multi-select-selection-limit-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-selection-limit.demo.html',
})
export class MultiSelectSelectionLimitDemo {
  protected readonly toppings: SelectOption<string>[] = [
    { label: 'Cheese', value: 'cheese' },
    { label: 'Pepperoni', value: 'pepperoni' },
    { label: 'Mushrooms', value: 'mushrooms' },
    { label: 'Olives', value: 'olives' },
    { label: 'Onions', value: 'onions' },
  ];

  protected selectedToppings: string[] = ['cheese'];
}
