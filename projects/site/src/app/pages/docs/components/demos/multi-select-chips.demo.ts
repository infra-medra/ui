import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-multi-select-chips-demo',
  imports: [FormsModule, MultiSelectComponent],
  templateUrl: './multi-select-chips.demo.html',
})
export class MultiSelectChipsDemo {
  protected readonly skills: SelectOption<string>[] = [
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Angular', value: 'angular' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Accessibility', value: 'a11y' },
    { label: 'Testing', value: 'testing' },
    { label: 'CSS', value: 'css' },
  ];

  protected selectedSkills: string[] = ['angular', 'rxjs'];
}
