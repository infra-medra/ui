import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-radio-button-disabled-demo',
  imports: [FormsModule, RadioButtonComponent],
  templateUrl: './radio-button-disabled.demo.html',
})
export class RadioButtonDisabledDemo {
  protected selected = 'checked';
}
