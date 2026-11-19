import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent, type SelectOption } from '@medra.dev/ui';

/**
 * Each option carries its own group in `SelectOption.group`; the panel renders the group label as a header.
 * Keep the options of the same group next to each other: a header is created whenever `group` changes from
 * the previous option, so options of one group that are separated would repeat the header.
 */
const FRAMEWORKS: SelectOption<string>[] = [
  { label: 'Angular', value: 'angular', group: 'Full framework' },
  { label: 'Ember', value: 'ember', group: 'Full framework' },
  { label: 'React', value: 'react', group: 'Library' },
  { label: 'Vue', value: 'vue', group: 'Library' },
  { label: 'Svelte', value: 'svelte', group: 'Compiler' },
  { label: 'SolidJS', value: 'solid', group: 'Compiler' },
];

@Component({
  selector: 'app-autocomplete-grouped-dropdown-demo',
  imports: [FormsModule, AutocompleteComponent],
  templateUrl: './autocomplete-grouped-dropdown.demo.html',
})
export class AutocompleteGroupedDropdownDemo {
  protected readonly suggestions = signal<SelectOption<string>[]>(FRAMEWORKS);
  protected framework: SelectOption<string> | null = null;

  protected onSearch(query: string): void {
    const text = query.trim().toLowerCase();
    this.suggestions.set(text === '' ? FRAMEWORKS : FRAMEWORKS.filter((option) => option.label.toLowerCase().includes(text)));
  }
}
