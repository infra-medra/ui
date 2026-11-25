import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-radio-button-filled-demo',
  imports: [FormsModule, RadioButtonComponent],
  templateUrl: './radio-button-filled.demo.html',
})
export class RadioButtonFilledDemo {
  protected choice = 'standard';
}
