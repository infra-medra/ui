import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-checkbox-indeterminate-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-indeterminate.demo.html',
})
export class CheckboxIndeterminateDemo {
  protected checked = false;
  protected indeterminate = true;
}
