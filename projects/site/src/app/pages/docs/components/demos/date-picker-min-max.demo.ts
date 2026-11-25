import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-min-max-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-min-max.demo.html',
})
export class DatePickerMinMaxDemo {
  protected readonly minDate = new Date(2026, 4, 5);
  protected readonly maxDate = new Date(2026, 4, 25);
  protected readonly disabledDates = [new Date(2026, 4, 13), new Date(2026, 4, 20)];
  protected readonly disabledDays = [0, 6];
  protected date: Date | null = new Date(2026, 4, 12);
}
