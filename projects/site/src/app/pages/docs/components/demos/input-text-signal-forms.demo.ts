import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { InputTextDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-input-text-signal-forms-demo',
  imports: [FormField, InputTextDirective],
  templateUrl: './input-text-signal-forms.demo.html',
})
export class InputTextSignalFormsDemo {
  private readonly model = signal({ username: '' });
  protected readonly userForm = form(this.model);
  protected readonly current = () => this.model().username;
}
