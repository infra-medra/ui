import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-radio-button-template-driven-demo',
  imports: [FormsModule, RadioButtonComponent],
  templateUrl: './radio-button-template-driven.demo.html',
})
export class RadioButtonTemplateDrivenDemo {
  protected plan = 'free';
}
