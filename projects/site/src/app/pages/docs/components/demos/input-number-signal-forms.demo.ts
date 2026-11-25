import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { InputNumberComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-input-number-signal-forms-demo',
  imports: [FormField, InputNumberComponent],
  templateUrl: './input-number-signal-forms.demo.html',
})
export class InputNumberSignalFormsDemo {
  private readonly model = signal<{ quantity: number | null }>({ quantity: null });
  protected readonly numberForm = form(this.model);
  protected readonly current = () => this.model().quantity;
}
