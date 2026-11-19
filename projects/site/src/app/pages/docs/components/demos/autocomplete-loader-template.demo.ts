import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent, type SelectOption } from '@medra.dev/ui';

const FRAMEWORKS: SelectOption<string>[] = ['Angular', 'React', 'Vue', 'Svelte', 'SolidJS', 'Qwik', 'Ember'].map((label) => ({ label, value: label.toLowerCase() }));

@Component({
  selector: 'app-autocomplete-loader-template-demo',
  imports: [FormsModule, AutocompleteComponent],
  templateUrl: './autocomplete-loader-template.demo.html',
})
export class AutocompleteLoaderTemplateDemo {
  protected readonly suggestions = signal<SelectOption<string>[]>([]);
  protected readonly loading = signal(false);
  protected framework: SelectOption<string> | null = null;

  protected onSearch(query: string): void {
    const text = query.trim().toLowerCase();
    this.suggestions.set(FRAMEWORKS.filter((option) => option.label.toLowerCase().includes(text)));
  }

  /** Simulates refreshing the suggestions: `loading` is on for about 1.5 s after the panel opens. */
  protected onPanelShow(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }
}
