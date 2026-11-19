import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-listbox-multiple-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-multiple.demo.html',
})
export class ListboxMultipleDemo {
  protected readonly labels: SelectOption<string>[] = [
    { label: 'bug', value: 'bug' },
    { label: 'feature', value: 'feature' },
    { label: 'docs', value: 'docs' },
    { label: 'question', value: 'question' },
    { label: 'good-first-issue', value: 'good-first-issue' },
    { label: 'wontfix', value: 'wontfix' },
  ];

  protected selectedLabels: string[] = ['bug'];
}
