import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-radio-button-basic-demo',
  imports: [FormsModule, RadioButtonComponent],
  templateUrl: './radio-button-basic.demo.html',
})
export class RadioButtonBasicDemo {
  protected plan: 'free' | 'pro' | 'enterprise' = 'pro';
}
