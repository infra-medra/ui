import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-radio-button-invalid-demo',
  imports: [FormsModule, RadioButtonComponent],
  templateUrl: './radio-button-invalid.demo.html',
})
export class RadioButtonInvalidDemo {
  protected selected: string | null = null;
}
