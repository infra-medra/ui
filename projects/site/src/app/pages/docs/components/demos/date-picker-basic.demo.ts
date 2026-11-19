import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-date-picker-basic-demo',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './date-picker-basic.demo.html',
})
export class DatePickerBasicDemo {
  protected meetingDate: Date | null = null;
}
