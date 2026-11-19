import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, type SelectOption } from '@medra.dev/ui';

@Component({
  selector: 'app-multi-select-basic-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-basic.demo.html',
})
export class MultiSelectBasicDemo {
  protected readonly skills: SelectOption<string>[] = [
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Angular', value: 'angular' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Accessibility', value: 'a11y' },
    { label: 'Testing', value: 'testing' },
    { label: 'CSS', value: 'css', disabled: true },
  ];

  protected selectedSkills: string[] = [];
}
