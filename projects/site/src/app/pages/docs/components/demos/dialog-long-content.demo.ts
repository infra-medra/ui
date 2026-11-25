import { Component, signal } from '@angular/core';
import { ButtonDirective, DialogComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-dialog-long-content-demo',
  imports: [ButtonDirective, DialogComponent],
  templateUrl: './dialog-long-content.demo.html',
})
export class DialogLongContentDemo {
  protected readonly visible = signal(false);
  protected readonly paragraphs = Array.from({ length: 10 }, (_, index) =>
    `Section ${index + 1}: Long dialog bodies scroll inside the bounded panel height (85vh) while keeping the header and footer anchored.`,
  );
}
