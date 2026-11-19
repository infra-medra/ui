import { Component, signal } from '@angular/core';
import { SplitButtonComponent, type MenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-split-button-basic-demo',
  imports: [SplitButtonComponent],
  templateUrl: './split-button-basic.demo.html',
})
export class SplitButtonBasicDemo {
  protected readonly lastAction = signal('No action yet.');

  protected readonly items: MenuItem[] = [
    { label: 'Save as draft', icon: 'document-duplicate' },
    { label: 'Save and close', icon: 'arrow-down-tray' },
    { separator: true },
    { label: 'Discard', icon: 'trash' },
  ];

  protected onSave(): void {
    this.lastAction.set('Saved.');
  }

  protected onSelect(item: MenuItem): void {
    this.lastAction.set(`Selected: ${item.label}`);
  }
}
