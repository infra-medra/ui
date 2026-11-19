import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-select-lazy-demo',
  imports: [FormsModule, SelectComponent],
  templateUrl: './select-lazy.demo.html',
})
export class SelectLazyDemo {
  protected readonly options = signal<SelectOption<string>[]>(
    Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i + 1}`, value: `item-${i + 1}` })),
  );
  protected item: string | null = null;

  protected onLazyLoad(range: { first: number; last: number }): void {
    const current = this.options();
    if (range.last < current.length - 1) {
      return;
    }
    const nextStart = current.length;
    const more = Array.from({ length: 20 }, (_, i) => ({ label: `Item ${nextStart + i + 1}`, value: `item-${nextStart + i + 1}` }));
    this.options.set([...current, ...more]);
  }
}
