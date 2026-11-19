import { Component, signal } from '@angular/core';
import { FieldsetComponent, FieldsetLegendDirective, IconComponent, InputTextDirective } from '@medra/ui';

@Component({
  selector: 'app-fieldset-rich-legend-demo',
  imports: [FieldsetComponent, FieldsetLegendDirective, IconComponent, InputTextDirective],
  templateUrl: './fieldset-rich-legend.demo.html',
})
export class FieldsetRichLegendDemo {
  protected readonly collapsed = signal(false);
  protected readonly log = signal<string[]>([]);

  protected onBeforeToggle(current: boolean): void {
    this.log.update((lines) => [...lines, `beforeToggle: was ${current ? 'collapsed' : 'expanded'}`]);
  }

  protected onAfterToggle(next: boolean): void {
    this.log.update((lines) => [...lines, `afterToggle: now ${next ? 'collapsed' : 'expanded'}`]);
  }
}
