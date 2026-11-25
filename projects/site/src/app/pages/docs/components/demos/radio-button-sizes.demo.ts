import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-radio-button-sizes-demo',
  imports: [FormsModule, RadioButtonComponent],
  templateUrl: './radio-button-sizes.demo.html',
})
export class RadioButtonSizesDemo {
  protected size: 'sm' | 'default' | 'lg' = 'default';
}
