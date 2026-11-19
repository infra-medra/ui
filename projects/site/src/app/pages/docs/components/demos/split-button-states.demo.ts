import { Component } from '@angular/core';
import { SplitButtonComponent, type MenuItem } from '@medra/ui';

@Component({
  selector: 'app-split-button-states-demo',
  imports: [SplitButtonComponent],
  templateUrl: './split-button-states.demo.html',
})
export class SplitButtonStatesDemo {
  protected readonly items: MenuItem[] = [{ label: 'Option A' }, { label: 'Option B' }];
}
