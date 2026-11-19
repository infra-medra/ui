import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent, type SelectOption } from '@medra/ui';

/** Each option carries its group in `SelectOption.group`; options of the same group stay together. */
const FRAMEWORKS: SelectOption<string>[] = [
  { label: 'Angular', value: 'angular', group: 'Full framework' },
  { label: 'Ember', value: 'ember', group: 'Full framework' },
  { label: 'React', value: 'react', group: 'Library' },
  { label: 'Vue', value: 'vue', group: 'Library' },
  { label: 'Svelte', value: 'svelte', group: 'Compiler' },
  { label: 'SolidJS', value: 'solid', group: 'Compiler' },
];

@Component({
  selector: 'app-autocomplete-group-template-demo',
  imports: [FormsModule, AutocompleteComponent],
  templateUrl: './autocomplete-group-template.demo.html',
})
export class AutocompleteGroupTemplateDemo {
  protected readonly suggestions = signal<SelectOption<string>[]>([]);
  protected framework: SelectOption<string> | null = null;

  protected onSearch(query: string): void {
    const text = query.trim().toLowerCase();
    this.suggestions.set(FRAMEWORKS.filter((option) => option.label.toLowerCase().includes(text)));
  }
}
