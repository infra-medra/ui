import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-time-only-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-time-only.demo.html',
})
export class DatePickerTimeOnlyDemo {
  protected time: Date | null = null;
}
