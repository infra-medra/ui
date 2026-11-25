import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-signal-forms-demo',
  imports: [FormField, DatePickerComponent],
  templateUrl: './date-picker-signal-forms.demo.html',
})
export class DatePickerSignalFormsDemo {
  private readonly model = signal<{ date: Date | null }>({ date: null });
  protected readonly dateForm = form(this.model);
  protected readonly current = () => this.model().date;
}
