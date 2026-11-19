import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-listbox-basic-demo',
  imports: [FormsModule, ListboxComponent],
  templateUrl: './listbox-basic.demo.html',
})
export class ListboxBasicDemo {
  protected readonly labels: SelectOption<string>[] = [
    { label: 'bug', value: 'bug' },
    { label: 'feature', value: 'feature' },
    { label: 'docs', value: 'docs' },
    { label: 'question', value: 'question' },
    { label: 'good-first-issue', value: 'good-first-issue' },
    { label: 'wontfix', value: 'wontfix' },
  ];

  protected selectedLabel: string | null = null;
}
