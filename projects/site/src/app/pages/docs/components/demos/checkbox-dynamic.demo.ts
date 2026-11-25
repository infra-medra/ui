import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra.dev/ui';

interface Category {
  readonly key: string;
  readonly name: string;
}

@Component({
  selector: 'app-checkbox-dynamic-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-dynamic.demo.html',
})
export class CheckboxDynamicDemo {
  protected readonly categories: readonly Category[] = [
    { key: 'A', name: 'Accounting' },
    { key: 'M', name: 'Marketing' },
    { key: 'P', name: 'Production' },
    { key: 'R', name: 'Research' },
  ];
  protected selectedCategories: string[] = ['Accounting'];
}
