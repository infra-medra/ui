import { Component, signal } from '@angular/core';
import { ListboxComponent, type SelectOption } from '@medra/ui';

@Component({
  selector: 'app-listbox-dragdrop-demo',
  imports: [ListboxComponent],
  templateUrl: './listbox-dragdrop.demo.html',
})
export class ListboxDragdropDemo {
  protected readonly steps = signal<readonly SelectOption<string>[]>([
    { label: '1. Checkout code', value: 'checkout' },
    { label: '2. Install dependencies', value: 'install' },
    { label: '3. Run tests', value: 'test' },
    { label: '4. Deploy', value: 'deploy' },
  ]);

  protected onReorder(event: { options: readonly SelectOption<string>[] }): void {
    this.steps.set(event.options);
  }
}
