import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-checkbox-invalid-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-invalid.demo.html',
})
export class CheckboxInvalidDemo {
  protected checked = false;
}
