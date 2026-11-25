import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonComponent } from '@medra.dev/ui';

interface Category {
  readonly key: string;
  readonly name: string;
}

@Component({
  selector: 'app-radio-button-dynamic-demo',
  imports: [FormsModule, RadioButtonComponent],
  templateUrl: './radio-button-dynamic.demo.html',
})
export class RadioButtonDynamicDemo {
  protected readonly categories: readonly Category[] = [
    { key: 'A', name: 'Accounting' },
    { key: 'M', name: 'Marketing' },
    { key: 'P', name: 'Production' },
    { key: 'R', name: 'Research' },
  ];
  protected selectedCategory = 'Accounting';
}
