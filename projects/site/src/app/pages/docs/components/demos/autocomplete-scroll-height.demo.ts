import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent, type SelectOption } from '@medra/ui';

const LANGUAGES: SelectOption<string>[] = [
  'Ada', 'Bash', 'C', 'C#', 'Dart', 'Elixir', 'Erlang', 'Go', 'Haskell', 'Java', 'Kotlin', 'Lua', 'OCaml', 'Python', 'Rust', 'Scala', 'Swift', 'TypeScript',
].map((label) => ({ label, value: label.toLowerCase() }));

@Component({
  selector: 'app-autocomplete-scroll-height-demo',
  imports: [FormsModule, AutocompleteComponent],
  templateUrl: './autocomplete-scroll-height.demo.html',
})
export class AutocompleteScrollHeightDemo {
  protected readonly suggestions = signal<SelectOption<string>[]>([]);
  protected language: SelectOption<string> | null = null;

  protected onSearch(query: string): void {
    const text = query.trim().toLowerCase();
    this.suggestions.set(LANGUAGES.filter((option) => option.label.toLowerCase().includes(text)));
  }
}
