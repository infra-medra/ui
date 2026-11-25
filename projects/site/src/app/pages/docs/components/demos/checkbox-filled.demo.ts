import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-checkbox-filled-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-filled.demo.html',
})
export class CheckboxFilledDemo {
  protected checked = false;
}
