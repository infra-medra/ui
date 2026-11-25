import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { CheckboxComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-checkbox-signal-forms-demo',
  imports: [FormField, CheckboxComponent],
  templateUrl: './checkbox-signal-forms.demo.html',
})
export class CheckboxSignalFormsDemo {
  private readonly model = signal({ accepted: false });
  protected readonly termsForm = form(this.model);
  protected readonly current = () => this.model().accepted;
}
