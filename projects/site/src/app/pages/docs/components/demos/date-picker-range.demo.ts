import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent, type DateRange } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-range-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-range.demo.html',
})
export class DatePickerRangeDemo {
  protected range: DateRange = { start: null, end: null };
}
