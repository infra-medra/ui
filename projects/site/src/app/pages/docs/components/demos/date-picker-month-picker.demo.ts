import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-month-picker-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-month-picker.demo.html',
})
export class DatePickerMonthPickerDemo {
  protected month: Date | null = null;
}
