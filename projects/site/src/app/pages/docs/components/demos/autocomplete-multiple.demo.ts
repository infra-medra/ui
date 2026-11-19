import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent, type SelectOption } from '@medra.dev/ui';

const FRAMEWORKS: SelectOption<string>[] = [
  { label: 'Angular', value: 'angular' },
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'SolidJS', value: 'solid' },
  { label: 'Qwik', value: 'qwik' },
  { label: 'Ember', value: 'ember' },
];

@Component({
  selector: 'app-autocomplete-multiple-demo',
  imports: [FormsModule, AutocompleteComponent],
  templateUrl: './autocomplete-multiple.demo.html',
})
export class AutocompleteMultipleDemo {
  protected readonly suggestions = signal<SelectOption<string>[]>([]);
  protected frameworks: SelectOption<string>[] = [FRAMEWORKS[0], FRAMEWORKS[2]];

  protected onSearch(query: string): void {
    const text = query.trim().toLowerCase();
    this.suggestions.set(FRAMEWORKS.filter((option) => option.label.toLowerCase().includes(text)));
  }
}
