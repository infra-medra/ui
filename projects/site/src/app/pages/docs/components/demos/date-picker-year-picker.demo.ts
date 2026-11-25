import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-year-picker-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-year-picker.demo.html',
})
export class DatePickerYearPickerDemo {
  protected year: Date | null = null;
}
