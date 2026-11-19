import { Component, signal } from '@angular/core';
import { BlockUiComponent, ButtonDirective, InputTextDirective } from '@medra/ui';

@Component({
  selector: 'app-block-ui-basic-demo',
  imports: [BlockUiComponent, ButtonDirective, InputTextDirective],
  templateUrl: './block-ui-basic.demo.html',
})
export class BlockUiBasicDemo {
  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 2000);
  }
}
