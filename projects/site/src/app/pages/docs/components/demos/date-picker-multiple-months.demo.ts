import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-multiple-months-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-multiple-months.demo.html',
})
export class DatePickerMultipleMonthsDemo {
  protected date: Date | null = null;
}
