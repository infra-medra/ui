import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { RadioButtonComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-radio-button-signal-forms-demo',
  imports: [FormField, RadioButtonComponent],
  templateUrl: './radio-button-signal-forms.demo.html',
})
export class RadioButtonSignalFormsDemo {
  private readonly model = signal({ plan: 'free' });
  protected readonly planForm = form(this.model);
  protected readonly current = () => this.model().plan;
}
