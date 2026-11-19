import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent, type SelectOption } from '@medra.dev/ui';

const ITEMS: SelectOption<number>[] = Array.from({ length: 10_000 }, (_, index) => ({ label: `Sample ${index + 1}`, value: index + 1 }));

@Component({
  selector: 'app-autocomplete-virtual-scroll-demo',
  imports: [FormsModule, AutocompleteComponent],
  templateUrl: './autocomplete-virtual-scroll.demo.html',
})
export class AutocompleteVirtualScrollDemo {
  protected readonly suggestions = signal<SelectOption<number>[]>([]);
  protected readonly lastRange = signal('none');
  protected item: SelectOption<number> | null = null;

  protected onSearch(query: string): void {
    const text = query.trim().toLowerCase();
    this.suggestions.set(ITEMS.filter((option) => option.label.toLowerCase().includes(text)));
  }

  protected onLazyLoad(range: { first: number; last: number }): void {
    this.lastRange.set(`${range.first} - ${range.last}`);
  }
}
