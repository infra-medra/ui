import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent, type SelectOption } from '@medra/ui';

const FRAMEWORKS: SelectOption<string>[] = ['Angular', 'React', 'Vue', 'Svelte', 'SolidJS', 'Qwik', 'Ember'].map((label) => ({ label, value: label.toLowerCase() }));

@Component({
  selector: 'app-autocomplete-readonly-demo',
  imports: [FormsModule, AutocompleteComponent],
  templateUrl: './autocomplete-readonly.demo.html',
})
export class AutocompleteReadonlyDemo {
  protected readonly suggestions = signal<SelectOption<string>[]>([]);
  protected framework: SelectOption<string> | null = { label: 'Angular', value: 'angular' };

  protected onSearch(query: string): void {
    const text = query.trim().toLowerCase();
    this.suggestions.set(FRAMEWORKS.filter((option) => option.label.toLowerCase().includes(text)));
  }
}
