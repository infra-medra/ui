import { Component, signal } from '@angular/core';
import { ButtonDirective, StepsComponent, type StepItem } from '@medra/ui';

@Component({
  selector: 'app-steps-basic-demo',
  imports: [ButtonDirective, StepsComponent],
  templateUrl: './steps-basic.demo.html',
})
export class StepsBasicDemo {
  protected readonly activeIndex = signal(0);

  protected readonly items: StepItem[] = [{ label: 'Cart' }, { label: 'Shipping' }, { label: 'Payment' }, { label: 'Confirm' }];

  protected back(): void {
    this.activeIndex.update((i) => Math.max(0, i - 1));
  }

  protected next(): void {
    this.activeIndex.update((i) => Math.min(this.items.length - 1, i + 1));
  }
}
