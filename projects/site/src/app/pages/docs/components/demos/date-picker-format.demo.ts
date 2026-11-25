import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-format-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-format.demo.html',
})
export class DatePickerFormatDemo {
  protected shortDate: Date | null = new Date(2026, 4, 15);
  protected isoDate: Date | null = new Date(2026, 4, 15);
}
