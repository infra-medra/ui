import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-multiple-month-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-multiple-month.demo.html',
})
export class DatePickerMultipleMonthDemo {
  protected holidays: readonly Date[] = [];
  protected billingMonth: Date | null = null;
}
