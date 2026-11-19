import { Component, inject } from '@angular/core';
import { ButtonDirective, DIALOG_REF } from '@medra/ui';

/** The dialog's own content component — passed to `DialogService.open()` below. */
@Component({
  selector: 'app-dialog-content-demo',
  imports: [ButtonDirective],
  templateUrl: './dialog-content.demo.html',
})
export class DialogContentDemo {
  protected readonly dialogRef = inject(DIALOG_REF);
}
