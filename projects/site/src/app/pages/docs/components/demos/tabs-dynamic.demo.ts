import { Component, signal } from '@angular/core';
import { ButtonDirective, TabComponent, TabsComponent } from '@medra.dev/ui';

interface DynamicTabItem {
  readonly id: number;
  readonly header: string;
  readonly content: string;
}

@Component({
  selector: 'app-tabs-dynamic-demo',
  imports: [ButtonDirective, TabComponent, TabsComponent],
  templateUrl: './tabs-dynamic.demo.html',
})
export class TabsDynamicDemo {
  protected readonly tabs = signal<readonly DynamicTabItem[]>([
    { id: 1, header: 'Tab 1', content: 'Dynamic content for tab 1.' },
    { id: 2, header: 'Tab 2', content: 'Dynamic content for tab 2.' },
    { id: 3, header: 'Tab 3', content: 'Dynamic content for tab 3.' },
  ]);

  protected addTab(): void {
    const next = this.tabs().length + 1;
    this.tabs.update((current) => [
      ...current,
      { id: next, header: `Tab ${next}`, content: `Dynamic content for tab ${next}.` },
    ]);
  }
}
