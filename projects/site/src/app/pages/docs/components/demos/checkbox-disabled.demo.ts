import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-checkbox-disabled-demo',
  imports: [FormsModule, CheckboxComponent],
  templateUrl: './checkbox-disabled.demo.html',
})
export class CheckboxDisabledDemo {
  protected checked = true;
}
