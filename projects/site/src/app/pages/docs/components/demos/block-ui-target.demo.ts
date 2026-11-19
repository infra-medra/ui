import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { BlockUiComponent, ButtonDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-block-ui-target-demo',
  imports: [BlockUiComponent, ButtonDirective],
  templateUrl: './block-ui-target.demo.html',
})
export class BlockUiTargetDemo {
  protected readonly panel = viewChild.required<ElementRef<HTMLElement>>('panelEl');
  protected readonly blocked = signal(false);

  protected toggle(): void {
    this.blocked.update((value) => !value);
  }
}
